import { v4 as uuid } from 'uuid';
import { isEqual } from 'radash';
import {
  COMPONENT,
  COMPONENT_START,
  PROFILE_CHANGE,
  PAGE_HIDDEN,
  buildClientNinetailedRequestContext,
  type ProfileChangedPayload,
  type Profile,
  type InterestedInSeenElements,
  type InterestedInProfileChange,
  type InterestedInHiddenPage,
  type AcceptsCredentials,
  type Credentials,
  AnalyticsInstance,
} from '@ninetailed/experience.js';

import {
  type ComponentViewEvent,
  buildComponentViewEvent,
} from '@ninetailed/experience.js-shared';
import type { ComponentViewEventBatch } from './types/Event/ComponentViewEventBatch';
import { NinetailedInsightsApiClient } from './api/NinetailedInsightsApiClient';
import {
  ElementSeenPayload,
  EventHandler,
  HAS_SEEN_ELEMENT,
  NinetailedPlugin,
} from '@ninetailed/experience.js-plugin-analytics';

type ObservedElementPayload = Omit<ElementSeenPayload, 'element'>;

export class NinetailedInsightsPlugin
  extends NinetailedPlugin
  implements
    InterestedInSeenElements,
    InterestedInProfileChange,
    InterestedInHiddenPage,
    AcceptsCredentials
{
  public override name = 'ninetailed:insights';

  private seenElements = new WeakMap<Element, ObservedElementPayload[]>();

  private profile?: Profile;

  private events: ComponentViewEvent[] = [];

  private eventsQueue: ComponentViewEventBatch[] = [];

  private static MAX_EVENTS = 25;

  private insightsApiClient?: NinetailedInsightsApiClient;

  private readonly insightsApiClientUrl?: string;
  private instance?: AnalyticsInstance;

  constructor({ url }: { url?: string } = {}) {
    super();

    this.insightsApiClientUrl = url;
  }

  public initialize = async ({ instance }: { instance: AnalyticsInstance }) => {
    this.instance = instance;
  };

  public [HAS_SEEN_ELEMENT]: EventHandler<ElementSeenPayload> = ({
    payload,
  }) => {
    const { element, experience, variant, variantIndex } = payload;

    const { element: _, ...elementPayloadWithoutElement } = payload;

    const componentId = variant.id;

    if (typeof componentId === 'undefined') {
      return;
    }

    const elementPayloads = this.seenElements.get(payload.element) || [];

    const isElementAlreadySeenWithPayload = elementPayloads.some(
      (elementPayload) => {
        return isEqual(elementPayload, elementPayloadWithoutElement);
      }
    );

    if (isElementAlreadySeenWithPayload) {
      return;
    }

    this.seenElements.set(element, [
      ...elementPayloads,
      elementPayloadWithoutElement,
    ]);

    /**
     * Intentionally sending a COMPONENT_START event instead of COMPONENT.
     * The NinetailedPrivacyPlugin, when used, will listen to COMPONENT_START and abort it if no consent is given.
     * If COMPONENT_START is aborted, the COMPONENT event will not be sent.
     * If NinetailedPrivacyPlugin is not used, the COMPONENT_START event will trigger the COMPONENT event.
     *
     * This behavior of the analytics library can be seen in the source code here:
     * https://github.com/DavidWells/analytics/blob/ba02d13d8b9d092cf24835b65f4f90af18f2740b/packages/analytics-core/src/index.js#L577
     */
    this.instance?.dispatch({
      type: COMPONENT_START,
      componentId,
      variantIndex,
      experienceId: experience?.id,
    });
  };

  public [COMPONENT]: EventHandler<ComponentViewEvent> = ({ payload }) => {
    const { componentId, experienceId, variantIndex } = payload;

    const ctx = buildClientNinetailedRequestContext();
    const event = buildComponentViewEvent({
      ctx,
      componentId,
      experienceId,
      variantIndex,
      messageId: uuid(),
      timestamp: Date.now(),
    });

    this.events.push(event);

    if (this.shouldFlushEventsQueue()) {
      if (this.profile) {
        this.createEventsBatch(this.profile);
      }

      this.flushEventsQueue();
    }
  };

  public [PROFILE_CHANGE]: EventHandler<ProfileChangedPayload> = ({
    payload,
  }) => {
    const { profile } = payload;

    const previousProfile = this.profile ?? profile;

    this.createEventsBatch(previousProfile);

    this.profile = profile;

    this.seenElements = new WeakMap<Element, ElementSeenPayload[]>();
  };

  public [PAGE_HIDDEN] = () => {
    if (!this.profile) {
      return;
    }

    this.createEventsBatch(this.profile);

    this.flushEventsQueue(true);
  };

  private createEventsBatch(previousProfile: Profile) {
    if (this.events.length === 0) {
      return;
    }

    const profileBatch = {
      profile: previousProfile,
      events: this.events,
    };

    this.eventsQueue.push(profileBatch);

    this.events = [];
  }

  private shouldFlushEventsQueue(): boolean {
    return (
      this.eventsQueue.map(({ events }) => events).flat().length +
        this.events.length ===
      NinetailedInsightsPlugin.MAX_EVENTS
    );
  }

  private flushEventsQueue(useBeacon = false) {
    if (this.eventsQueue.length === 0) {
      return;
    }

    this.insightsApiClient?.sendEventBatches(this.eventsQueue, {
      useBeacon,
    });

    this.eventsQueue = [];
  }

  setCredentials(credentials: Credentials) {
    this.insightsApiClient = new NinetailedInsightsApiClient({
      url: this.insightsApiClientUrl,
      clientId: credentials.clientId,
      environment: credentials.environment,
    });
  }
}
