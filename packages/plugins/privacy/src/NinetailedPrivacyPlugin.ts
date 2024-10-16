import {
  EventType,
  EXPERIENCES_FALLBACK_CACHE,
  Feature,
  FEATURES,
  logger,
  pickBy,
  PROFILE_CHANGE,
  PROFILE_FALLBACK_CACHE,
} from '@ninetailed/experience.js-shared';
import {
  AnalyticsInstance,
  CONSENT,
  COMPONENT,
  COMPONENT_START,
  PLUGIN_NAME as NINETAILED_CORE_PLUGIN_NAME,
  SET_ENABLED_FEATURES,
} from '@ninetailed/experience.js';
import wildCardMatch from 'wildcard-match';
import { isEqual } from 'radash';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';

declare global {
  interface Window {
    ninetailed?: {
      reset: () => void;
      plugins?: {
        [name: string]: unknown;
      };
    } & unknown;
  }
}

export const PLUGIN_NAME = 'ninetailed:privacy';

export type PrivacyConfig = {
  /**
   * Which events you want to allow?
   *
   * default is ['page', 'track']
   */
  allowedEvents: EventType[];
  /**
   * Which page event properties will be allowed?
   *
   * default is ['*']
   */
  allowedPageEventProperties: string[];
  /**
   * Which Track event properties (additional data in an track event) will be allowed?
   *
   * default is [] (no additional data will be allowed)
   */
  allowedTrackEvents: string[];
  /**
   * What kind of track events will be allowed? This is the event name lilke 'click_add_to_cart'
   *
   * default is [] - (no track events will be allowed)
   */
  allowedTrackEventProperties: string[];
  /**
   * Which user traits will be allowed?
   *
   * default is [] - no user traits will be allowed
   */
  allowedTraits: string[];
  /**
   * Shall the merging of profiles (attaching an ID to a profile) be allowed?
   *
   * default is false
   */
  blockProfileMerging: boolean;

  /**
   * Which features will be enabled?
   *
   * default is [] - no feature will be enabled
   */
  enabledFeatures: Feature[];
};

export const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  allowedEvents: ['page', 'track'],
  allowedPageEventProperties: ['*'],
  allowedTrackEventProperties: [],
  allowedTrackEvents: [],
  allowedTraits: [],
  blockProfileMerging: true,
  enabledFeatures: [],
};

export const DEFAULT_ACCEPTED_CONSENT_CONFIG: PrivacyConfig = {
  allowedEvents: ['page', 'track', 'identify', 'component'],
  allowedPageEventProperties: ['*'],
  allowedTrackEventProperties: ['*'],
  allowedTrackEvents: ['*'],
  allowedTraits: ['*'],
  blockProfileMerging: false,
  enabledFeatures: Object.values(FEATURES),
};

const PAGE_EVENT_HANDLER = `page:${NINETAILED_CORE_PLUGIN_NAME}` as const;
const TRACK_EVENT_HANDLER = `track:${NINETAILED_CORE_PLUGIN_NAME}` as const;
const IDENTIFY_EVENT_HANDLER =
  `identify:${NINETAILED_CORE_PLUGIN_NAME}` as const;

export class NinetailedPrivacyPlugin extends NinetailedPlugin {
  public name = PLUGIN_NAME;
  private _instance: AnalyticsInstance | null = null;
  private _ready = false;

  private readonly config: PrivacyConfig;
  private readonly acceptedConsentConfig: PrivacyConfig;

  constructor(
    config?: Partial<PrivacyConfig>,
    acceptedConsentConfig?: Partial<PrivacyConfig>
  ) {
    super();

    this.config = { ...DEFAULT_PRIVACY_CONFIG, ...config };
    this.acceptedConsentConfig = {
      ...DEFAULT_ACCEPTED_CONSENT_CONFIG,
      ...acceptedConsentConfig,
    };
  }

  private get instance(): AnalyticsInstance {
    if (!this._instance) {
      throw new Error(
        'The Ninetailed Privacy Plugin was not initialized correctly. Please make sure to call the initialize method before using it.'
      );
    }

    return this._instance;
  }

  private consent(accepted: boolean) {
    if (accepted) {
      this.instance.storage.setItem(CONSENT, 'accepted');
    } else {
      this.instance.storage.removeItem(CONSENT);
    }
  }

  private isConsentGiven() {
    const consent = this.instance.storage.getItem(CONSENT);
    return consent && consent === 'accepted';
  }

  private registerWindowHandlers() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.ninetailed = Object.assign({}, window.ninetailed, {
        consent: this.consent.bind(this),
      });
    } catch (error) {
      window.ninetailed = Object.assign({}, window.ninetailed, {
        consent: () => {
          console.warn(
            `The ninetailed privacy plugin consent method could not get initialized.`
          );
        },
      });
    }
  }

  private getConfig() {
    if (!this.isConsentGiven()) {
      return this.config;
    }

    return this.acceptedConsentConfig;
  }

  private pickAllowedKeys(object: object, allowedKeys: string[]) {
    if (allowedKeys.includes('*')) {
      return object;
    }

    const matchFunctions = allowedKeys.map((key) => wildCardMatch(key));
    return pickBy(
      object,
      (_, key) => matchFunctions.filter((match) => match(key)).length > 0
    );
  }

  private async enableFeatures(features: Feature[]) {
    await this.instance.dispatch({
      type: SET_ENABLED_FEATURES,
      features,
    });
  }

  public initialize = async ({ instance }: { instance: AnalyticsInstance }) => {
    this._instance = instance;

    instance.on('setItemEnd', async ({ payload: { key } }) => {
      if (key === CONSENT) {
        await this.enableFeatures(this.getConfig().enabledFeatures);
      }
    });
    await this.enableFeatures(this.getConfig().enabledFeatures);

    this.registerWindowHandlers();

    this._ready = true;
  };

  public ready = async () => {
    return this._ready;
  };

  public loaded = () => {
    return this._ready;
  };

  private notifyOnRejectedEvent() {
    this.instance.dispatch({
      type: PROFILE_CHANGE,
      error: new Error(
        'The request to Experience API was blocked by the privacy plugin. No profile was found in the cache.'
      ),
    });
  }

  private handleEventStart =
    (
      eventType: EventType,
      modifyPayloadFn?: (payload: any, abort: () => void) => any
    ) =>
    ({ payload, abort }: { payload: any; abort: any }) => {
      if (!this.getConfig().allowedEvents.includes(eventType)) {
        this.notifyOnRejectedEvent();

        return abort();
      }

      if (typeof modifyPayloadFn === 'function') {
        return modifyPayloadFn(payload, abort);
      }

      return payload;
    };

  public pageStart = this.handleEventStart('page');
  public [PAGE_EVENT_HANDLER] = this.handleEventStart('page', (payload) => {
    const properties = this.pickAllowedKeys(
      payload.properties,
      this.getConfig().allowedPageEventProperties
    );

    if (!isEqual(payload.properties, properties)) {
      logger.info(
        '[Ninetailed Privacy Plugin] Some properties were removed from the page event, as they are not allowed to send by your configuration. The following properties were kept:',
        properties
      );
    }

    return { ...payload, properties };
  });

  public trackStart = this.handleEventStart('track');
  public [TRACK_EVENT_HANDLER] = this.handleEventStart(
    'track',
    (payload, abort) => {
      if (!this.getConfig().allowedTrackEvents.includes(payload.event)) {
        logger.info(
          '[Ninetailed Privacy Plugin] The track event was blocked, as it is not allowed to send by your configuration.'
        );

        this.notifyOnRejectedEvent();

        return abort();
      }

      const properties = this.pickAllowedKeys(
        payload.properties,
        this.getConfig().allowedTrackEventProperties
      );

      if (!isEqual(payload.properties, properties)) {
        logger.info(
          '[Ninetailed Privacy Plugin] Some properties were removed from the track event, as they are not allowed to send by your configuration. The following properties were kept:',
          properties
        );
      }

      return { ...payload, properties };
    }
  );

  public identifyStart = this.handleEventStart('identify');
  public [IDENTIFY_EVENT_HANDLER] = this.handleEventStart(
    'identify',
    (payload) => {
      const traits = this.pickAllowedKeys(
        payload.traits,
        this.getConfig().allowedTraits
      );
      if (!isEqual(payload.traits, traits)) {
        logger.info(
          '[Ninetailed Privacy Plugin] Some traits were removed from the identify event, as they are not allowed to send by your configuration. The following traits were kept:',
          traits
        );
      }

      if (this.getConfig().blockProfileMerging && payload.userId) {
        logger.info(
          '[Ninetailed Privacy Plugin] Profile merging is blocked. The userId will be ignored.'
        );
      }

      const userId = this.getConfig().blockProfileMerging ? '' : payload.userId;

      return { ...payload, traits, userId };
    }
  );

  public [COMPONENT_START] = this.handleEventStart(COMPONENT);

  public methods = {
    consent: this.consent.bind(this),
  };
}
