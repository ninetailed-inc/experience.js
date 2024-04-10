import {
  EventType,
  Feature,
  FEATURES,
  logger,
  pickBy,
} from '@ninetailed/experience.js-shared';
import {
  AnalyticsInstance,
  CONSENT,
  COMPONENT,
  COMPONENT_START,
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

type PrivacyConfig = {
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

const DEFAULT_PRIVACY_CONFIG: PrivacyConfig = {
  allowedEvents: ['page', 'track'],
  allowedPageEventProperties: ['*'],
  allowedTrackEventProperties: [],
  allowedTrackEvents: [],
  allowedTraits: [],
  blockProfileMerging: true,
  enabledFeatures: [],
};

export class NinetailedPrivacyPlugin extends NinetailedPlugin {
  public name = PLUGIN_NAME;
  private _instance: AnalyticsInstance | null = null;

  private readonly config: PrivacyConfig;
  private readonly queue: any[] = [];

  constructor(config?: Partial<PrivacyConfig>) {
    super();

    this.config = { ...DEFAULT_PRIVACY_CONFIG, ...config };
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
      this.enableFeatures(Object.values(FEATURES));
    } else {
      this.instance.storage.removeItem(CONSENT);
      this.enableFeatures(this.config.enabledFeatures);
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
  };

  public ready = async () => {
    if (!this.isConsentGiven()) {
      await this.enableFeatures(this.config.enabledFeatures);
    } else {
      await this.enableFeatures(Object.values(FEATURES));
    }

    this.registerWindowHandlers();

    logger.debug('Ninetailed Privacy Plugin ready.');
  };

  public loaded = () => true;

  private handleEventStart =
    (
      eventType: EventType,
      modifyPayloadFn?: (payload: any, abort: () => void) => any
    ) =>
    ({ payload, abort }: { payload: any; abort: any }) => {
      if (!this.isConsentGiven()) {
        if (!this.config.allowedEvents.includes(eventType)) {
          this.queue.push(payload);

          return abort();
        }

        if (typeof modifyPayloadFn === 'function') {
          return modifyPayloadFn(payload, abort);
        }
      }

      return payload;
    };

  public pageStart = this.handleEventStart('page');
  public ['page:ninetailed'] = this.handleEventStart('page', (payload) => {
    const properties = this.pickAllowedKeys(
      payload.properties,
      this.config.allowedPageEventProperties
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
  public ['track:ninetailed'] = this.handleEventStart(
    'track',
    (payload, abort) => {
      if (!this.config.allowedTrackEvents.includes(payload.event)) {
        logger.info(
          '[Ninetailed Privacy Plugin] The track event was blocked, as it is not allowed to send by your configuration.'
        );

        this.queue.push(payload);

        return abort();
      }

      const properties = this.pickAllowedKeys(
        payload.properties,
        this.config.allowedTrackEventProperties
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
  public ['identify:ninetailed'] = this.handleEventStart(
    'identify',
    (payload) => {
      const traits = this.pickAllowedKeys(
        payload.traits,
        this.config.allowedTraits
      );
      if (!isEqual(payload.traits, traits)) {
        logger.info(
          '[Ninetailed Privacy Plugin] Some traits were removed from the identify event, as they are not allowed to send by your configuration. The following traits were kept:',
          traits
        );
      }

      if (this.config.blockProfileMerging && payload.userId) {
        logger.info(
          '[Ninetailed Privacy Plugin] Profile merging is blocked. The userId will be ignored.'
        );
      }

      const userId = this.config.blockProfileMerging ? '' : payload.userId;

      return { ...payload, traits, userId };
    }
  );

  public [COMPONENT_START] = this.handleEventStart(COMPONENT);

  public methods = {
    consent: this.consent.bind(this),
  };
}
