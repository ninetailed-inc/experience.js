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
  Reference,
  selectHasVariants,
  selectExperience,
  selectVariant,
  selectBaselineWithVariants,
  Event,
  isPageViewEvent,
  isTrackEvent,
  isIdentifyEvent,
  isComponentViewEvent,
  SerializableObject,
} from '@ninetailed/experience.js-shared';

import {
  EMPTY_MERGE_ID,
  NinetailedCorePlugin,
  OnInitProfileId,
  PLUGIN_NAME,
  PROFILE_CHANGE,
  EventHandlerAnalyticsInstance,
} from './NinetailedCorePlugin';
import {
  EventFunctionOptions,
  NinetailedInstance,
  OnIsInitializedCallback,
  OnProfileChangeCallback,
  ProfileState,
  TrackHasSeenComponent,
  TrackComponentView,
  OnChangesChangeCallback,
  TrackVariableComponentView,
} from './types';
import { PAGE_HIDDEN, HAS_SEEN_STICKY_COMPONENT } from './constants';
import { ElementSeenObserver, ObserveOptions } from './ElementSeenObserver';
import { acceptsCredentials } from './guards/acceptsCredentials';
import { isInterestedInHiddenPage } from './guards/isInterestedInHiddenPage';
import {
  OnSelectVariantArgs,
  OnSelectVariantCallback,
  OnSelectVariantCallbackArgs,
} from './types/OnSelectVariant';
import {
  makeChangesModificationMiddleware,
  makeExperienceSelectMiddleware,
} from './experience';
import { ExperienceSelectionMiddleware } from './types/interfaces/HasExperienceSelectionMiddleware';
import { RemoveOnChangeListener } from './utils/OnChangeEmitter';
import {
  ElementSeenPayload,
  HAS_SEEN_COMPONENT,
  HAS_SEEN_ELEMENT,
  HAS_SEEN_VARIABLE,
  HasComponentViewTrackingThreshold,
  NinetailedPlugin,
  hasComponentViewTrackingThreshold,
} from '@ninetailed/experience.js-plugin-analytics';
import { EventBuilder } from './utils/EventBuilder';
import { requiresEventBuilder } from './guards/requiresEventBuilder';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GetItem<T = any> = (key: string) => T;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  useSDKEvaluation?: boolean;
};

type NinetailedApiClientInstanceOrOptions =
  | NinetailedApiClient
  | NinetailedApiClientOptions;

type ObservedElementPayload = Omit<ElementSeenPayload, 'element'>;

const buildOverrideMiddleware =
  <TBaseline extends Reference, TVariant extends Reference>(
    experienceSelectionMiddleware: ExperienceSelectionMiddleware<
      TBaseline,
      TVariant
    >
  ) =>
  ({
    experience: originalExperience,
    variant: originalVariant,
    variantIndex: originalVariantIndex,
    ...other
  }: OnSelectVariantCallbackArgs<
    TBaseline,
    TVariant
  >): OnSelectVariantCallbackArgs<TBaseline, TVariant> => {
    const { experience, variant, variantIndex } = experienceSelectionMiddleware(
      {
        experience: originalExperience,
        variant: originalVariant,
        variantIndex: originalVariantIndex,
      }
    );

    return {
      ...other,
      audience: experience?.audience ? experience.audience : null,
      experience,
      variant,
      variantIndex,
    } as OnSelectVariantCallbackArgs<TBaseline, TVariant>;
  };

export class Ninetailed implements NinetailedInstance {
  private readonly instance: EventHandlerAnalyticsInstance;
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

  private readonly useSDKEvaluation: boolean;

  public readonly eventBuilder: EventBuilder;

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
      useSDKEvaluation = false,
    }: Options = {}
  ) {
    if (typeof onLog === 'function') {
      logger.addSink(new OnLogLogSink(onLog));
    }

    if (typeof onError === 'function') {
      logger.addSink(new OnErrorLogSink(onError));
    }

    this.logger = logger;

    this.useSDKEvaluation = useSDKEvaluation;

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

    this.eventBuilder = new EventBuilder(buildClientContext);

    this.plugins.forEach((plugin) => {
      if (acceptsCredentials(plugin) && this.clientId && this.environment) {
        plugin.setCredentials({
          clientId: this.clientId,
          environment: this.environment,
        });
      }

      if (hasComponentViewTrackingThreshold(plugin)) {
        plugin.setComponentViewTrackingThreshold(
          componentViewTrackingThreshold
        );
      }

      if (requiresEventBuilder(plugin)) {
        plugin.setEventBuilder(this.eventBuilder);
      }
    });

    this._profileState = {
      status: 'loading',
      profile: null,
      experiences: null,
      changes: null,
      error: null,
      from: 'api',
    };

    this.ninetailedCorePlugin = new NinetailedCorePlugin({
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
    }) as EventHandlerAnalyticsInstance;

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
      return this.handleMethodError(error, 'page');
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
      this.handleMethodError(error, 'track');
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
      this.handleMethodError(error, 'identify');
    }
  };

  public batch = async (events: Event[]) => {
    try {
      await this.waitUntilInitialized();

      const promises = events.map((event) => {
        if (isPageViewEvent(event)) {
          return this.instance.page(event.properties);
        }

        if (isTrackEvent(event)) {
          return this.instance.track(event.event, event.properties);
        }

        if (isIdentifyEvent(event)) {
          return this.instance.identify(
            event.userId || EMPTY_MERGE_ID,
            event.traits
          );
        }

        if (isComponentViewEvent(event)) {
          return this.instance.dispatch({
            experienceId: event.experienceId,
            componentId: event.componentId,
            variantIndex: event.variantIndex,
            type: HAS_SEEN_STICKY_COMPONENT,
          });
        }

        return Promise.resolve();
      });
      await Promise.all(promises);
      return this.ninetailedCorePlugin.flush();
    } catch (error) {
      this.handleMethodError(error, 'batch');
    }
  };

  public trackStickyComponentView = async ({
    experienceId,
    componentId,
    variantIndex,
  }: {
    experienceId: string;
    componentId: string;
    variantIndex: number;
  }) => {
    try {
      await this.waitUntilInitialized();
      await this.instance.dispatch({
        experienceId,
        componentId,
        variantIndex,
        type: HAS_SEEN_STICKY_COMPONENT,
      });
      return this.ninetailedCorePlugin.flush();
    } catch (error) {
      this.handleMethodError(error, 'trackStickyComponentView');
    }
  };

  /**
   * @deprecated The legacy datamodel is not recommended anymore
   * Will be removed in the next version of the SDK
   */
  public trackHasSeenComponent: TrackHasSeenComponent = async (properties) => {
    return this.instance.dispatch({ ...properties, type: HAS_SEEN_COMPONENT });
  };

  public trackVariableComponentView: TrackVariableComponentView = (
    properties
  ) => {
    const validatedVariable = SerializableObject.parse(properties.variable);

    return this.instance.dispatch({
      ...properties,
      type: HAS_SEEN_VARIABLE,
      variable: validatedVariable,
    });
  };

  public trackComponentView: TrackComponentView = (properties) => {
    return this.instance.dispatch({
      ...properties,
      type: HAS_SEEN_ELEMENT,
      // TODO this is a temporary solution - to not make the user specify a delay
      seenFor: this.componentViewTrackingThreshold,
    });
  };

  private get pluginsWithCustomComponentViewThreshold() {
    return [this.ninetailedCorePlugin, ...this.plugins].filter((plugin) =>
      hasComponentViewTrackingThreshold(plugin)
    ) as (NinetailedPlugin & HasComponentViewTrackingThreshold)[];
  }

  public observeElement = (
    payload: ElementSeenPayload,
    options?: ObserveOptions
  ) => {
    const { element, ...remainingPayload } = payload;

    if (!(element instanceof Element)) {
      this.logInvalidElement(element);
      return;
    }

    this.storeElementPayload(element, remainingPayload);
    this.setupElementObservation(element, options?.delay);
  };

  private logInvalidElement(element: unknown) {
    const isObject = typeof element === 'object' && element !== null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const constructorName = isObject ? (element as any).constructor.name : '';
    const isConstructorNameNotObject =
      constructorName && constructorName !== 'Object';

    logger.warn(
      `ElementSeenObserver.observeElement was called with an invalid element. Expected an Element but got ${typeof element}${
        isConstructorNameNotObject ? ` of type ${constructorName}` : ''
      }. This call will be ignored.`
    );
  }

  private storeElementPayload(
    element: Element,
    payload: ObservedElementPayload
  ) {
    const existingPayloads = this.observedElements.get(element) || [];

    // Check if the payload is already being observed for this element
    const isPayloadAlreadyObserved = existingPayloads.some(
      (existingPayload) =>
        JSON.stringify(existingPayload) === JSON.stringify(payload)
    );

    if (isPayloadAlreadyObserved) {
      return;
    }

    // Store the new or updated payloads
    this.observedElements.set(element, [...existingPayloads, payload]);
  }

  private setupElementObservation(element: Element, delay?: number) {
    // Get all relevant delays from plugins and the custom delay
    const pluginDelays = this.pluginsWithCustomComponentViewThreshold.map(
      (plugin) => plugin.getComponentViewTrackingThreshold()
    );

    // Ensure we only observe each delay once
    const uniqueDelays = Array.from(new Set([...pluginDelays, delay]));

    // Set up observation for each delay
    uniqueDelays.forEach((delay) => {
      this.elementSeenObserver.observe(element, { delay });
    });
  }

  public unobserveElement = (element: Element) => {
    this.observedElements.delete(element);
    this.elementSeenObserver.unobserve(element);
  };

  private onElementSeen = (element: Element, delay?: number) => {
    const payloads = this.observedElements.get(element);

    if (Array.isArray(payloads) && payloads.length > 0) {
      for (const payload of payloads) {
        this.instance.dispatch({
          ...payload,
          element,
          type: HAS_SEEN_ELEMENT,
          seenFor: delay,
        });
      }
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
          changes: payload.changes,
          experiences: payload.experiences,
          error: null,
        });
      }
    });
  };

  public onSelectVariant = <
    Baseline extends Reference,
    Variant extends Reference
  >(
    { baseline, experiences }: OnSelectVariantArgs<Baseline, Variant>,
    cb: OnSelectVariantCallback<Baseline, Variant>
  ) => {
    let middlewareChangeListeners: RemoveOnChangeListener[] = [];
    let state: OnSelectVariantCallbackArgs<Baseline, Variant> | null = null;

    const removeMiddlewareChangeListeners: RemoveOnChangeListener = () => {
      middlewareChangeListeners.forEach((removeListener) => removeListener());
      middlewareChangeListeners = [];
    };

    const setSelectedVariant = (
      newState: OnSelectVariantCallbackArgs<Baseline, Variant>
    ) => {
      state = newState;
      cb(state);
    };

    const removeProfileChangeListener = this.onProfileChange((profileState) => {
      const {
        addListeners,
        removeListeners,
        middleware: experienceSelectionMiddleware,
      } = makeExperienceSelectMiddleware<Baseline, Variant>({
        plugins: this.plugins,
        experiences,
        baseline,
        profile: profileState.profile,
        onChange: (middleware) => {
          const overrideResult = buildOverrideMiddleware(middleware);
          if (state !== null) {
            setSelectedVariant(overrideResult(state));
          }
        },
      });

      addListeners();
      middlewareChangeListeners.push(removeListeners);

      const overrideResult = buildOverrideMiddleware(
        experienceSelectionMiddleware
      );

      const hasVariants = experiences
        .map((experience) => selectHasVariants(experience, baseline))
        .reduce((acc, curr) => acc || curr, false);

      const baseReturn = {
        ...profileState,
        hasVariants,
        baseline,
      };
      const emptyReturn = {
        ...baseReturn,
        experience: null,
        variant: baseline,
        variantIndex: 0,
        audience: null,
        isPersonalized: false,
        profile: null,
        error: null,
      };

      if (profileState.status === 'loading') {
        setSelectedVariant(
          overrideResult({
            ...emptyReturn,
            loading: true,
            status: 'loading',
          })
        );
        return;
      }

      if (profileState.status === 'error') {
        setSelectedVariant(
          overrideResult({
            ...emptyReturn,
            loading: false,
            status: 'error',
            error: profileState.error,
          })
        );
        return;
      }

      const { profile, experiences: selectedExperiences } = profileState;

      if (!profile || !selectedExperiences) {
        setSelectedVariant(
          overrideResult({
            ...emptyReturn,
            loading: false,
            status: 'error',
            error: new Error(
              'No Profile or Selected Experiences were returned by the API'
            ),
          })
        );
        return;
      }

      if (this.useSDKEvaluation) {
        const experience = selectExperience({
          experiences,
          profile,
        });

        if (!experience) {
          setSelectedVariant(
            overrideResult({
              ...emptyReturn,
              loading: false,
              status: 'success',
              profile,
            })
          );
          return;
        }

        const { variant, index } = selectVariant({
          baseline,
          experience,
          profile,
        });

        setSelectedVariant(
          overrideResult({
            ...baseReturn,
            status: 'success',
            loading: false,
            error: null,
            experience,
            variant,
            variantIndex: index,
            audience: experience.audience ? experience.audience : null,
            profile,
            isPersonalized: true,
          })
        );
        return;
      }

      const experience = experiences.find((experience) =>
        selectedExperiences.some(
          (selectedExperience) =>
            selectedExperience.experienceId === experience.id
        )
      );
      const selectedExperience = selectedExperiences.find(
        ({ experienceId }) => experienceId === experience?.id
      );

      if (!experience || !selectedExperience) {
        setSelectedVariant(
          overrideResult({
            ...emptyReturn,
            loading: false,
            status: 'success',
            profile,
          })
        );
        return;
      }

      const experienceWithStickyFromExperienceApi = {
        ...experience,
        sticky: selectedExperience.sticky,
      };

      const baselineVariants = selectBaselineWithVariants(
        experienceWithStickyFromExperienceApi,
        baseline
      );
      if (!baselineVariants) {
        setSelectedVariant(
          overrideResult({
            ...emptyReturn,
            loading: false,
            status: 'success',
            profile,
          })
        );
        return;
      }

      const { variants } = baselineVariants;
      const variant = [baseline, ...variants][selectedExperience.variantIndex];

      if (!variant) {
        setSelectedVariant(
          overrideResult({
            ...emptyReturn,
            loading: false,
            status: 'success',
            profile,
          })
        );
        return;
      }

      setSelectedVariant(
        overrideResult({
          ...baseReturn,
          status: 'success',
          loading: false,
          error: null,
          experience: experienceWithStickyFromExperienceApi,
          variant,
          variantIndex: selectedExperience.variantIndex,
          audience: experience.audience ? experience.audience : null,
          profile,
          isPersonalized: true,
        })
      );
    });

    return () => {
      removeProfileChangeListener();
      removeMiddlewareChangeListeners();
    };
  };

  /**
   * Registers a callback to be notified when changes occur in the profile state.
   * Uses the changes modification middleware system to process changes.
   * Changes are processed in the following order:
   *
   * @param cb - Callback function that receives the changes state
   * @returns Function to unsubscribe from changes updates
   */
  public onChangesChange = (cb: OnChangesChangeCallback) => {
    // Initially notify with current state
    this.notifyChangesCallback(cb, this._profileState);

    let middlewareChangeListeners: RemoveOnChangeListener[] = [];

    const removeProfileChangeListener = this.onProfileChange((profileState) => {
      // Clean up any existing middleware listeners
      middlewareChangeListeners.forEach((removeListener) => removeListener());
      middlewareChangeListeners = [];

      // If we're in loading or error state, simply pass through
      if (profileState.status !== 'success') {
        this.notifyChangesCallback(cb, profileState);
        return;
      }

      // Set up middleware for changes
      const {
        addListeners,
        removeListeners,
        middleware: changesModificationMiddleware,
      } = makeChangesModificationMiddleware({
        plugins: this.plugins,
        changes: profileState.changes || [],
        onChange: (updatedMiddleware) => {
          // When plugin state changes, reapply middleware to current changes
          if (profileState.status === 'success' && profileState.changes) {
            const { changes: modifiedChanges } = updatedMiddleware({
              changes: profileState.changes,
            });

            cb({
              status: 'success',
              changes: modifiedChanges,
              error: null,
            });
          }
        },
      });

      // Add listeners for plugin changes
      addListeners();
      middlewareChangeListeners.push(removeListeners);

      // Apply middleware to current changes
      if (profileState.changes) {
        const { changes: modifiedChanges } = changesModificationMiddleware({
          changes: profileState.changes,
        });

        cb({
          status: 'success',
          changes: modifiedChanges,
          error: null,
        });
      } else {
        cb({
          status: 'success',
          changes: [],
          error: null,
        });
      }
    });

    // Return a function that cleans up all listeners
    return () => {
      removeProfileChangeListener();
      middlewareChangeListeners.forEach((removeListener) => removeListener());
    };
  };

  /**
   * Helper method to extract changes state from profile state and notify callback
   * @private
   */
  private notifyChangesCallback(
    cb: OnChangesChangeCallback,
    profileState: ProfileState
  ): void {
    if (profileState.status === 'loading') {
      cb({
        status: 'loading',
        changes: null,
        error: null,
      });
    } else if (profileState.status === 'error') {
      cb({
        status: 'error',
        changes: null,
        error: profileState.error,
      });
    } else {
      cb({
        status: 'success',
        changes: profileState.changes,
        error: null,
      });
    }
  }

  // Always throws, never returns
  private handleMethodError(error: unknown, method: string): never {
    logger.error(error as Error);

    if (error instanceof RangeError) {
      throw new Error(
        `[Validation Error] "${method}" was called with invalid params. Could not validate due to "RangeError: Maximum call stack size exceeded". This can be caused by passing a cyclic data structure as a parameter. Refrain from passing a cyclic data structure or sanitize it beforehand.`
      );
    }
    throw error;
  }

  public onIsInitialized = (
    onIsInitializedCallback: OnIsInitializedCallback
  ) => {
    if (typeof onIsInitializedCallback === 'function') {
      if (this.isInitialized) {
        onIsInitializedCallback();
      } else {
        const detachOnReadyListener = this.instance.on('ready', () => {
          this.isInitialized = true;
          onIsInitializedCallback();
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

  // The following methods are used to register methods of the Ninetailed instance on the window object.
  // GTM templates do not support executing async functions in `callInWindow`.
  // Therefore, we provide a versions of those methods without the async keyword.

  private trackAsWindowHandler: typeof Ninetailed.prototype.track = (
    event: string,
    properties?: Properties,
    options?: EventFunctionOptions
  ) => {
    return this.track(event, properties, options);
  };

  private identifyAsWindowHandler: typeof Ninetailed.prototype.identify = (
    uid: string,
    traits?: Traits,
    options?: EventFunctionOptions
  ) => {
    return this.identify(uid, traits, options);
  };

  private pageAsWindowHandler: typeof Ninetailed.prototype.page = (
    data?: Partial<PageviewProperties>,
    options?: EventFunctionOptions
  ) => {
    return this.page(data, options);
  };

  private registerWindowHandlers() {
    if (typeof window !== 'undefined') {
      window.ninetailed = Object.assign({}, window.ninetailed, {
        page: this.pageAsWindowHandler.bind(this),
        track: this.trackAsWindowHandler.bind(this),
        identify: this.identifyAsWindowHandler.bind(this),
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
