import { AnalyticsInstance } from 'analytics';
import {
  Event,
  Locale,
  buildIdentifyEvent,
  buildPageEvent,
  buildTrackEvent,
  NinetailedApiClient,
  ConsoleLogSink,
  logger,
  FEATURES,
  Feature,
  unionBy,
  NinetailedRequestContext,
  buildComponentViewEvent,
} from '@ninetailed/experience.js-shared';

import { buildClientNinetailedRequestContext } from './Events';
import { asyncThrottle } from '../utils/asyncThrottle';
import {
  ANONYMOUS_ID,
  CONSENT,
  DEBUG_FLAG,
  EMPTY_MERGE_ID,
  EXPERIENCES_FALLBACK_CACHE,
  LEGACY_ANONYMOUS_ID,
  PROFILE_CHANGE,
  PROFILE_FALLBACK_CACHE,
  PROFILE_RESET,
  SET_ENABLED_FEATURES,
} from './constants';
import { NinetailedInstance, FlushResult, NinetailedPlugin } from '../types';
import { HAS_SEEN_STICKY_COMPONENT } from '../constants';

export type OnInitProfileId = (
  profileId?: string
) => Promise<string | undefined> | string | undefined;

type AnalyticsPluginNinetailedConfig = {
  apiClient: NinetailedApiClient;
  locale?: Locale;
  requestTimeout?: number;

  onInitProfileId?: OnInitProfileId;

  buildClientContext?: () => NinetailedRequestContext;

  ninetailed: NinetailedInstance;
};

export const PLUGIN_NAME = 'ninetailed';

type EventFn = { payload: any; instance: InternalAnalyticsInstance };

type AbortableFnParams = { abort: () => void; payload: unknown };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type InternalAnalyticsInstance = AnalyticsInstance & {
  dispatch: (action: any) => void;
};

export interface NinetailedCorePlugin extends NinetailedPlugin {
  flush: () => Promise<FlushResult>;
}

export const ninetailedCorePlugin = ({
  apiClient,
  locale,
  ninetailed,

  onInitProfileId,

  buildClientContext,
}: AnalyticsPluginNinetailedConfig): NinetailedCorePlugin => {
  let _instance: InternalAnalyticsInstance;
  let queue: Event[] = [];

  let enabledFeatures: Feature[] = Object.values(FEATURES);

  const buildContext =
    buildClientContext || buildClientNinetailedRequestContext;

  const flush = async () => {
    const events: Event[] = Object.assign([], queue);
    logger.info('Start flushing events.');
    queue = [];
    if (!events.length) {
      return { success: true };
    }

    try {
      const anonymousId = _instance.storage.getItem(ANONYMOUS_ID);
      const { profile, experiences } = await apiClient.upsertProfile(
        {
          profileId: anonymousId,
          events,
        },
        { locale, enabledFeatures }
      );
      _instance.storage.setItem(ANONYMOUS_ID, profile.id);
      _instance.storage.setItem(PROFILE_FALLBACK_CACHE, profile);
      _instance.storage.setItem(EXPERIENCES_FALLBACK_CACHE, experiences);
      logger.debug('Profile from api: ', profile);
      logger.debug('Experiences from api: ', experiences);
      _instance.dispatch({
        type: PROFILE_CHANGE,
        profile,
        experiences,
      });
      await delay(20);
      return { success: true };
    } catch (error) {
      logger.debug('An error occurred during flushing the events: ', error);
      const fallbackProfile = _instance.storage.getItem(PROFILE_FALLBACK_CACHE);
      const fallbackExperiences =
        _instance.storage.getItem(EXPERIENCES_FALLBACK_CACHE) || [];

      if (fallbackProfile) {
        logger.debug('Found a fallback profile - will use this.');
        _instance.dispatch({
          type: PROFILE_CHANGE,
          profile: fallbackProfile,
          experiences: fallbackExperiences,
        });
      } else {
        logger.debug('No fallback profile found - setting profile to null.');
        _instance.dispatch({
          type: PROFILE_CHANGE,
          profile: null,
          experiences: fallbackExperiences,
          error,
        });
      }

      return { success: false };
    }
  };

  const enqueueEvent = async (event: Event) => {
    queue = unionBy([event], queue, 'messageId');
  };

  const abortNonClientEvents = ({ abort, payload }: AbortableFnParams) => {
    if (typeof window !== 'object') {
      return abort();
    }

    return payload;
  };

  return {
    name: 'ninetailed',
    config: {},
    initialize: async ({
      instance,
    }: {
      instance: InternalAnalyticsInstance;
    }) => {
      _instance = instance;

      if (instance.storage.getItem(DEBUG_FLAG)) {
        logger.addSink(new ConsoleLogSink());
        logger.info('Ninetailed Debug Mode is enabled.');
      }

      // legacy support for the old anonymousId
      const legacyAnonymousId = instance.storage.getItem(LEGACY_ANONYMOUS_ID);
      if (legacyAnonymousId) {
        logger.debug(
          'Found legacy anonymousId, migrating to new one.',
          legacyAnonymousId
        );
        instance.storage.setItem(ANONYMOUS_ID, legacyAnonymousId);
        instance.storage.removeItem(LEGACY_ANONYMOUS_ID);
      }

      if (typeof onInitProfileId === 'function') {
        const profileId = await onInitProfileId(
          instance.storage.getItem(ANONYMOUS_ID)
        );
        if (typeof profileId === 'string') {
          instance.storage.setItem(ANONYMOUS_ID, profileId);
        }
      }

      instance.on(
        SET_ENABLED_FEATURES,
        ({ payload }: { payload: { features: Feature[] } }) => {
          enabledFeatures = payload.features || [];
        }
      );

      logger.debug('Ninetailed Core plugin initialized.');
    },
    flush: asyncThrottle<void, { success: boolean }>(flush),
    pageStart: (params: AbortableFnParams) => {
      return abortNonClientEvents(params);
    },
    page: async ({ payload }: EventFn) => {
      logger.info('Sending Page event.');
      const ctx = buildContext();
      return enqueueEvent(
        buildPageEvent({
          messageId: payload.meta.rid,
          timestamp: payload.meta.ts,
          properties: payload.properties,
          ctx,
        })
      );
    },
    trackStart: (params: AbortableFnParams) => {
      return abortNonClientEvents(params);
    },
    track: async ({ payload }: EventFn) => {
      logger.info('Sending Track event.');
      const ctx = buildContext();
      return enqueueEvent(
        buildTrackEvent({
          messageId: payload.meta.rid,
          timestamp: payload.meta.ts,
          event: payload.event,
          properties: payload.properties,
          ctx,
        })
      );
    },
    identifyStart: (params: AbortableFnParams) => {
      return abortNonClientEvents(params);
    },
    identify: async ({ payload }: EventFn) => {
      logger.info('Sending Identify event.');
      const ctx = buildContext();

      if (
        payload.userId === EMPTY_MERGE_ID &&
        (!payload.traits ||
          (typeof payload.traits === 'object' &&
            Object.keys(payload.traits).length === 0))
      ) {
        logger.info(
          'Skipping Identify event as no userId and no traits are set.'
        );
        return;
      }

      return enqueueEvent(
        buildIdentifyEvent({
          messageId: payload.meta.rid,
          timestamp: payload.meta.ts,
          traits: payload.traits,
          userId: payload.userId === EMPTY_MERGE_ID ? '' : payload.userId,
          ctx,
        })
      );
    },
    [HAS_SEEN_STICKY_COMPONENT]: async ({ payload }: EventFn) => {
      logger.info('Sending Sticky Components event.');
      const ctx = buildContext();
      return enqueueEvent(
        buildComponentViewEvent({
          messageId: payload.meta.rid,
          timestamp: payload.meta.ts,
          componentId: payload.componentId,
          experienceId: payload.experienceId,
          variantIndex: payload.variantIndex,
          ctx,
        })
      );
    },
    setItemStart: ({ abort, payload }: { abort: any; payload: any }) => {
      if (
        ![
          ANONYMOUS_ID,
          DEBUG_FLAG,
          PROFILE_FALLBACK_CACHE,
          EXPERIENCES_FALLBACK_CACHE,
          CONSENT,
        ].includes(payload.key)
      ) {
        return abort();
      }

      return payload;
    },
    methods: {
      reset: async (...args: any[]) => {
        logger.debug('Resetting profile.');
        const instance = args[args.length - 1] as InternalAnalyticsInstance;
        instance.dispatch({ type: PROFILE_RESET });
        instance.storage.removeItem(ANONYMOUS_ID);
        instance.storage.removeItem(PROFILE_FALLBACK_CACHE);
        instance.storage.removeItem(EXPERIENCES_FALLBACK_CACHE);
        logger.debug('Removed old profile data from localstorage.');

        if (typeof onInitProfileId === 'function') {
          const profileId = await onInitProfileId(undefined);
          if (typeof profileId === 'string') {
            instance.storage.setItem(ANONYMOUS_ID, profileId);
          }
        }

        await ninetailed.track('nt_reset');

        logger.info('Profile reset successful.');
        await delay(10);
      },
      debug: async (...args: any[]) => {
        const enabled: boolean = args[0];
        const instance = args[args.length - 1] as InternalAnalyticsInstance;

        const consoleLogSink = new ConsoleLogSink();

        if (enabled) {
          instance.storage.setItem(DEBUG_FLAG, true);
          logger.addSink(consoleLogSink);
          logger.info('Debug mode enabled.');
        } else {
          instance.storage.removeItem(DEBUG_FLAG);
          logger.info('Debug mode disabled.');
          logger.removeSink(consoleLogSink.name);
        }
      },
    },
  };
};
