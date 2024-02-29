import Analytics from 'analytics';
import {
  Locale,
  Traits,
  logger,
  OnLogHandler,
  OnErrorHandler,
  Logger,
  OnLogLogSink,
  OnErrorLogSink,
  PageviewProperties,
  Properties,
  NinetailedApiClient,
  NinetailedApiClientOptions,
  NinetailedRequestContext,
} from '@ninetailed/experience.js-shared';

import {
  EMPTY_MERGE_ID,
  NinetailedCorePlugin,
  ninetailedCorePlugin,
  OnInitProfileId,
  PLUGIN_NAME,
  PROFILE_CHANGE,
} from './ninetailedCorePlugin';
import {
  EventFunctionOptions,
  NinetailedInstance,
  NinetailedPlugin,
  OnIsInitializedCallback,
  OnProfileChangeCallback,
  ProfileState,
  TrackHasSeenComponent,
  AnalyticsInstance,
  ElementSeenPayload,
  TrackComponentView,
} from './types';
import { HAS_SEEN_COMPONENT, HAS_SEEN_ELEMENT, PAGE_HIDDEN } from './constants';
import { ElementSeenObserver, ObserveOptions } from './ElementSeenObserver';
import { acceptsCredentials } from './guards/acceptsCredentials';
import { isInterestedInHiddenPage } from './guards/isInterestedInHiddenPage';

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

type GetItem<T = any> = (key: string) => T;

type SetItem<T = any> = (key: string, value: T) => void;

type RemoveItem = (key: string) => void;

export type Storage = {
  getItem: GetItem;
  setItem: SetItem;
  removeItem: RemoveItem;
};

type Options = {
  url?: string;
  locale?: Locale;
  plugins?: (NinetailedPlugin | NinetailedPlugin[])[];
  requestTimeout?: number;
  onLog?: OnLogHandler;
  onError?: OnErrorHandler;
  componentViewTrackingThreshold?: number;
  onInitProfileId?: OnInitProfileId;
  buildClientContext?: () => NinetailedRequestContext;
  storageImpl?: Storage;
};

type NinetailedApiClientInstanceOrOptions =
  | NinetailedApiClient
  | NinetailedApiClientOptions;

type ObservedElementPayload = Omit<ElementSeenPayload, 'element'>;

export class Ninetailed implements NinetailedInstance {
  private readonly instance: AnalyticsInstance;
  private _profileState: ProfileState;
  private isInitialized = false;
  private readonly apiClient: NinetailedApiClient;
  private readonly ninetailedCorePlugin: NinetailedCorePlugin;
  private readonly elementSeenObserver: ElementSeenObserver;
  private readonly observedElements: WeakMap<Element, ObservedElementPayload[]>;

  private readonly clientId;
  private readonly environment;

  public readonly plugins: NinetailedPlugin[];
  public readonly logger: Logger;

  private readonly componentViewTrackingThreshold: number;

  constructor(
    ninetailedApiClientInstanceOrOptions: NinetailedApiClientInstanceOrOptions,
    {
      plugins,
      url,
      locale,
      requestTimeout,
      onLog,
      onError,
      buildClientContext,
      onInitProfileId,
      componentViewTrackingThreshold = 2000,
      storageImpl,
    }: Options = {}
  ) {
    if (ninetailedApiClientInstanceOrOptions instanceof NinetailedApiClient) {
      this.apiClient = ninetailedApiClientInstanceOrOptions;
    } else {
      const { clientId, environment, preview } =
        ninetailedApiClientInstanceOrOptions;
      this.clientId = clientId;
      this.environment = environment || 'main';

      this.apiClient = new NinetailedApiClient({
        clientId,
        environment,
        url,
        preview,
      });
    }

    this.plugins = (plugins ?? []).flat();

    this.plugins.forEach((plugin) => {
      if (acceptsCredentials(plugin) && this.clientId && this.environment) {
        plugin.setCredentials({
          clientId: this.clientId,
          environment: this.environment,
        });
      }
    });

    this._profileState = {
      status: 'loading',
      profile: null,
      experiences: null,
      error: null,
      from: 'api',
    };

    if (typeof onLog === 'function') {
      logger.addSink(new OnLogLogSink(onLog));
    }

    if (typeof onError === 'function') {
      logger.addSink(new OnErrorLogSink(onError));
    }

    this.logger = logger;
    this.ninetailedCorePlugin = ninetailedCorePlugin({
      apiClient: this.apiClient,
      locale,
      requestTimeout,
      buildClientContext,

      onInitProfileId,

      ninetailed: this,
    });

    this.instance = Analytics({
      app: 'ninetailed',
      plugins: [...this.plugins, this.ninetailedCorePlugin],
      ...(storageImpl ? { storage: storageImpl } : {}),
    }) as AnalyticsInstance;

    const detachOnReadyListener = this.instance.on('ready', () => {
      this.isInitialized = true;
      logger.info('Ninetailed Experience.js SDK is completely initialized.');
      detachOnReadyListener();
    });

    // put in private method
    this.onProfileChange((profileState) => {
      this._profileState = profileState;

      if (typeof window !== 'undefined') {
        window.ninetailed = Object.assign({}, window.ninetailed, {
          profile: this.profileState.profile,
          experiences: this.profileState.experiences,
        });
      }
    });

    this.observedElements = new WeakMap();

    this.elementSeenObserver = new ElementSeenObserver({
      onElementSeen: this.onElementSeen.bind(this),
    });
    this.componentViewTrackingThreshold = componentViewTrackingThreshold;

    const hasPluginsInterestedInHiddenPage = this.plugins.some(
      isInterestedInHiddenPage
    );

    if (hasPluginsInterestedInHiddenPage) {
      this.onVisibilityChange();
    }

    this.registerWindowHandlers();
  }

  public page = async (
    data?: Partial<PageviewProperties>,
    options?: EventFunctionOptions
  ) => {
    try {
      const result = PageviewProperties.partial().default({}).safeParse(data);
      if (!result.success) {
        throw new Error(
          `[Validation Error] "page" was called with invalid params. Page data is not valid: ${result.error.format()}`
        );
      }

      await this.waitUntilInitialized();
      await this.instance.page(data, this.buildOptions(options));
      return this.ninetailedCorePlugin.flush();
    } catch (error) {
      logger.error(error as Error);

      if (error instanceof RangeError) {
        throw new Error(
          `[Validation Error] "page" was called with invalid params. Could not validate due to "RangeError: Maximum call stack size exceeded". This can be caused by passing a cyclic data structure as a parameter. Refrain from passing a cyclic data structure or sanitize it beforehand.`
        );
      }
      throw error;
    }
  };

  public track = async (
    event: string,
    properties?: Properties,
    options?: EventFunctionOptions
  ) => {
    try {
      const result = Properties.default({}).safeParse(properties);
      if (!result.success) {
        throw new Error(
          `[Validation Error] "track" was called with invalid params. Properties are no valid json object: ${result.error.format()}`
        );
      }
      await this.waitUntilInitialized();
      await this.instance.track(
        event.toString(),
        result.data,
        this.buildOptions(options)
      );
      return this.ninetailedCorePlugin.flush();
    } catch (error) {
      logger.error(error as Error);

      if (error instanceof RangeError) {
        throw new Error(
          `[Validation Error] "track" was called with invalid params. Could not validate due to "RangeError: Maximum call stack size exceeded". This can be caused by passing a cyclic data structure as a parameter. Refrain from passing a cyclic data structure or sanitize it beforehand.`
        );
      }
      throw error;
    }
  };

  /**
   * @deprecated The legacy datamodel is not recommended anymore
   * Will be removed in the next version of the SDK
   */
  public trackHasSeenComponent: TrackHasSeenComponent = async (properties) => {
    return this.instance.dispatch({ ...properties, type: HAS_SEEN_COMPONENT });
  };

  public trackComponentView: TrackComponentView = (properties) => {
    return this.instance.dispatch({ ...properties, type: HAS_SEEN_ELEMENT });
  };

  public observeElement = (
    payload: ElementSeenPayload,
    options?: ObserveOptions
  ) => {
    const { element, ...remaingPayload } = payload;

    if (!(element instanceof Element)) {
      const isObject = typeof element === 'object' && element !== null;
      const constructorName = isObject ? (element as any).constructor.name : '';
      const isConstructorNameNotObject =
        constructorName && constructorName !== 'Object';

      logger.warn(
        `ElementSeenObserver.observeElement was called with an invalid element. Expected an Element but got ${typeof element}${
          isConstructorNameNotObject ? ` of type ${constructorName}` : ''
        }. This call will be ignored.`
      );
    } else {
      if (!this.observedElements.has(element)) {
        this.observedElements.set(element, [remaingPayload]);
      } else {
        const existingPayloads = this.observedElements.get(element);

        if (!existingPayloads) {
          return;
        }

        const isPayloadAlreadyObserved = existingPayloads.some((payload) => {
          return JSON.stringify(payload) === JSON.stringify(remaingPayload);
        });

        if (isPayloadAlreadyObserved) {
          return;
        }

        this.observedElements.set(element, [
          ...existingPayloads,
          remaingPayload,
        ]);
      }

      this.elementSeenObserver.observe(element, {
        delay: this.componentViewTrackingThreshold,
        ...options,
      });
    }
  };

  public unobserveElement = (element: Element) => {
    this.observedElements.delete(element);
    this.elementSeenObserver.unobserve(element);
  };

  private onElementSeen = (element: Element) => {
    const payloads = this.observedElements.get(element);

    if (typeof payloads !== 'undefined') {
      for (const payload of payloads) {
        this.trackComponentView({ element, ...payload });
      }
    }
  };

  public identify = async (
    uid: string,
    traits?: Traits,
    options?: EventFunctionOptions
  ) => {
    try {
      const result = Traits.default({}).safeParse(traits);
      if (!result.success) {
        throw new Error(
          `[Validation Error] "identify" was called with invalid params. Traits are no valid json: ${result.error.format()}`
        );
      }

      await this.waitUntilInitialized();
      await this.instance.identify(
        uid && uid.toString() !== '' ? uid.toString() : EMPTY_MERGE_ID,
        result.data,
        this.buildOptions(options)
      );
      return this.ninetailedCorePlugin.flush();
    } catch (error) {
      logger.error(error as Error);

      if (error instanceof RangeError) {
        throw new Error(
          `[Validation Error] "identify" was called with invalid params. Could not validate due to "RangeError: Maximum call stack size exceeded". This can be caused by passing a cyclic data structure as a parameter. Refrain from passing a cyclic data structure or sanitize it beforehand.`
        );
      }
      throw error;
    }
  };

  public reset = async () => {
    await this.waitUntilInitialized();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.instance.plugins[PLUGIN_NAME].reset();
  };

  public debug = async (enabled: boolean) => {
    await this.waitUntilInitialized();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.instance.plugins[PLUGIN_NAME].debug(enabled);
  };

  public onProfileChange = (cb: OnProfileChangeCallback) => {
    cb(this.profileState);

    return this.instance.on(PROFILE_CHANGE, ({ payload }) => {
      if (payload.error) {
        cb({
          ...this._profileState,
          status: 'error',
          profile: payload.profile,
          experiences: payload.experiences,
          error: payload.error,
        });
      } else {
        cb({
          ...this._profileState,
          status: 'success',
          profile: payload.profile,
          experiences: payload.experiences,
          error: null,
        });
      }
    });
  };

  public onIsInitialized = (onIsInitialized: OnIsInitializedCallback) => {
    if (typeof onIsInitialized === 'function') {
      if (this.isInitialized) {
        onIsInitialized();
      } else {
        const detachOnReadyListener = this.instance.on('ready', () => {
          this.isInitialized = true;
          onIsInitialized();
          detachOnReadyListener();
        });
      }
    }
  };

  private waitUntilInitialized = (): Promise<void> => {
    return new Promise((resolve) => {
      this.onIsInitialized(resolve);
    });
  };

  public get profileState() {
    return this._profileState;
  }

  private buildOptions(
    options: EventFunctionOptions = {}
  ): EventFunctionOptions {
    return {
      ...options,
      // plugins: {
      //   all: false,
      //   ninetailed: true,
      //   ...this.plugins
      //     .map((plugin) => plugin as NamedAnalyticsPlugin)
      //     .filter((plugin) => includes(plugin.name, 'ninetailed:'))
      //     .reduce(
      //       (acc, curr) => ({
      //         ...acc,
      //         [curr.name]: true,
      //       }),
      //       {}
      //     ),
      //   ...get(options, 'plugins'),
      // },
    };
  }

  private registerWindowHandlers() {
    if (typeof window !== 'undefined') {
      window.ninetailed = Object.assign({}, window.ninetailed, {
        page: this.page.bind(this),
        track: this.track.bind(this),
        identify: this.identify.bind(this),
        reset: this.reset.bind(this),
        debug: this.debug.bind(this),
        profile: this.profileState.profile,
      });
    }
  }

  private onVisibilityChange = () => {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.instance.dispatch({ type: PAGE_HIDDEN });
      }
    });
  };
}
