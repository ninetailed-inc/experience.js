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
  SET_ENABLED_FEATURES,
} from '@ninetailed/experience.js-shared';
import {
  NinetailedAnalyticsPlugin,
  SanitizedElementSeenPayload,
} from '@ninetailed/experience.js-plugin-analytics';
// import { NinetailedAnalyticsPlugin } from '@ninetailed/experience.js-plugin-analytics';

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
} from './constants';
import { NinetailedInstance, FlushResult } from '../types';
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

export const PLUGIN_NAME = 'ninetailed:core';

type EventFn = { payload: any; instance: InternalAnalyticsInstance };

type AbortableFnParams = { abort: () => void; payload: unknown };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

type InternalAnalyticsInstance = AnalyticsInstance & {
  dispatch: (action: any) => void;
};

export interface NinetailedCorePlugin extends NinetailedAnalyticsPlugin {
  flush: (args: void) => Promise<FlushResult>;
}

export class NinetailedCorePlugin
  extends NinetailedAnalyticsPlugin
  implements NinetailedCorePlugin
{
  public name = PLUGIN_NAME;

  private _instance?: InternalAnalyticsInstance;
  private queue: Event[] = [];

  private enabledFeatures: Feature[] = Object.values(FEATURES);

  private readonly buildContext: () => NinetailedRequestContext =
    buildClientNinetailedRequestContext;
  private readonly onInitProfileId?: OnInitProfileId;

  private readonly apiClient: NinetailedApiClient;
  private readonly locale?: Locale;
  private readonly ninetailed: NinetailedInstance;

  constructor({
    apiClient,
    locale,
    ninetailed,

    onInitProfileId,
    buildClientContext,
  }: AnalyticsPluginNinetailedConfig) {
    super();

    if (onInitProfileId) {
      this.onInitProfileId = onInitProfileId;
    }

    if (buildClientContext) {
      this.buildContext = buildClientContext;
    }

    this.apiClient = apiClient;
    this.ninetailed = ninetailed;
    this.locale = locale;
  }

  public async initialize({
    instance,
  }: {
    instance: InternalAnalyticsInstance;
  }) {
    this._instance = instance;

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

    if (typeof this.onInitProfileId === 'function') {
      const profileId = await this.onInitProfileId(
        instance.storage.getItem(ANONYMOUS_ID)
      );
      if (typeof profileId === 'string') {
        instance.storage.setItem(ANONYMOUS_ID, profileId);
      }
    }

    logger.debug('Ninetailed Core plugin initialized.');
  }

  public [SET_ENABLED_FEATURES] = async ({ payload }: EventFn) => {
    this.enabledFeatures = payload.features || [];
  };

  public pageStart(params: AbortableFnParams) {
    return this.abortNonClientEvents(params);
  }

  public async page({ payload }: EventFn) {
    logger.info('Sending Page event.');
    const ctx = this.buildContext();
    return this.enqueueEvent(
      buildPageEvent({
        messageId: payload.meta.rid,
        timestamp: payload.meta.ts,
        properties: payload.properties,
        ctx,
      })
    );
  }

  public trackStart(params: AbortableFnParams) {
    return this.abortNonClientEvents(params);
  }

  public async track({ payload }: EventFn) {
    logger.info('Sending Track event.');
    const ctx = this.buildContext();
    return this.enqueueEvent(
      buildTrackEvent({
        messageId: payload.meta.rid,
        timestamp: payload.meta.ts,
        event: payload.event,
        properties: payload.properties,
        ctx,
      })
    );
  }

  public identifyStart(params: AbortableFnParams) {
    return this.abortNonClientEvents(params);
  }

  public async identify({ payload }: EventFn) {
    logger.info('Sending Identify event.');
    const ctx = this.buildContext();

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

    return this.enqueueEvent(
      buildIdentifyEvent({
        messageId: payload.meta.rid,
        timestamp: payload.meta.ts,
        traits: payload.traits,
        userId: payload.userId === EMPTY_MERGE_ID ? '' : payload.userId,
        ctx,
      })
    );
  }

  public override getComponentViewTrackingThreshold = () => {
    return 0;
  };

  protected async onTrackExperience(
    properties: SanitizedElementSeenPayload
  ): Promise<void> {
    if (properties.experience.sticky) {
      await this.instance.dispatch({
        type: HAS_SEEN_STICKY_COMPONENT,
        componentId: properties.selectedVariant.id,
        experienceId: properties.experience.id,
        variantIndex: properties.selectedVariantIndex,
      });
      this.flush();
    }

    return Promise.resolve();
  }
  protected onTrackComponent() {
    return Promise.resolve();
  }

  public [HAS_SEEN_STICKY_COMPONENT] = async ({ payload }: EventFn) => {
    const ctx = this.buildContext();
    return this.enqueueEvent(
      buildComponentViewEvent({
        messageId: payload.meta.rid,
        timestamp: payload.meta.ts,
        componentId: payload.componentId,
        experienceId: payload.experienceId,
        variantIndex: payload.variantIndex,
        ctx,
      })
    );
  };

  public setItemStart({ abort, payload }: { abort: any; payload: any }) {
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
  }

  public methods = {
    reset: async (...args: any[]) => {
      logger.debug('Resetting profile.');
      const instance = args[args.length - 1] as InternalAnalyticsInstance;
      instance.dispatch({ type: PROFILE_RESET });
      instance.storage.removeItem(ANONYMOUS_ID);
      instance.storage.removeItem(PROFILE_FALLBACK_CACHE);
      instance.storage.removeItem(EXPERIENCES_FALLBACK_CACHE);
      logger.debug('Removed old profile data from localstorage.');

      if (typeof this.onInitProfileId === 'function') {
        const profileId = await this.onInitProfileId(undefined);
        if (typeof profileId === 'string') {
          instance.storage.setItem(ANONYMOUS_ID, profileId);
        }
      }

      await this.ninetailed.track('nt_reset');

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
  };

  private async enqueueEvent(event: Event) {
    this.queue = unionBy([event], this.queue, 'messageId');
  }

  private abortNonClientEvents({ abort, payload }: AbortableFnParams) {
    if (typeof window !== 'object') {
      return abort();
    }

    return payload;
  }

  private get instance(): InternalAnalyticsInstance {
    if (!this._instance) {
      throw new Error('Ninetailed Core plugin not initialized.');
    }

    return this._instance;
  }

  public flush = asyncThrottle<void, FlushResult>(this._flush.bind(this));

  private async _flush() {
    const events: Event[] = Object.assign([], this.queue);
    logger.info('Start flushing events.');
    this.queue = [];
    if (!events.length) {
      return { success: true };
    }

    try {
      const anonymousId = this.instance.storage.getItem(ANONYMOUS_ID);
      const { profile, experiences } = await this.apiClient.upsertProfile(
        {
          profileId: anonymousId,
          events,
        },
        { locale: this.locale, enabledFeatures: this.enabledFeatures }
      );
      this.instance.storage.setItem(ANONYMOUS_ID, profile.id);
      this.instance.storage.setItem(PROFILE_FALLBACK_CACHE, profile);
      this.instance.storage.setItem(EXPERIENCES_FALLBACK_CACHE, experiences);
      logger.debug('Profile from api: ', profile);
      logger.debug('Experiences from api: ', experiences);
      this.instance.dispatch({
        type: PROFILE_CHANGE,
        profile,
        experiences,
      });
      await delay(20);
      return { success: true };
    } catch (error) {
      logger.debug('An error occurred during flushing the events: ', error);
      const fallbackProfile = this.instance.storage.getItem(
        PROFILE_FALLBACK_CACHE
      );
      const fallbackExperiences =
        this.instance.storage.getItem(EXPERIENCES_FALLBACK_CACHE) || [];

      if (fallbackProfile) {
        logger.debug('Found a fallback profile - will use this.');
        this.instance.dispatch({
          type: PROFILE_CHANGE,
          profile: fallbackProfile,
          experiences: fallbackExperiences,
        });
      } else {
        logger.debug('No fallback profile found - setting profile to null.');
        this.instance.dispatch({
          type: PROFILE_CHANGE,
          profile: null,
          experiences: fallbackExperiences,
          error,
        });
      }

      return { success: false };
    }
  }
}
