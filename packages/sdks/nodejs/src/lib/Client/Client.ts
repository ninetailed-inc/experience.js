import { v4 as uuid } from 'uuid';
import type { Properties } from '@ninetailed/experience.js-shared';
import {
  buildIdentifyEvent,
  buildTrackEvent,
  FetchImpl,
  IdentifyEvent,
  NinetailedApiClient as BaseNinetailedAPIClient,
  NinetailedApiClientOptions,
  NinetailedRequestContext,
  TrackEvent,
  Traits,
  UpsertManyProfilesRequestOptions,
} from '@ninetailed/experience.js-shared';
import fetch from 'node-fetch';

type SendEventOptions = {
  anonymousId?: string;
  timestamp?: number;
} & UpsertManyProfilesRequestOptions;

export class NinetailedAPIClient extends BaseNinetailedAPIClient {
  constructor(options: NinetailedApiClientOptions) {
    super({ ...options, fetchImpl: fetch as unknown as FetchImpl });
  }

  public createIdentifyEvent(
    userId: string,
    traits: Traits,
    options?: SendEventOptions
  ): IdentifyEvent & { anonymousId: string } {
    const messageId = uuid();
    const anonymousId = options?.anonymousId || userId;
    const timestamp = options?.timestamp || Date.now();
    return {
      ...buildIdentifyEvent({
        messageId,
        timestamp,
        ctx: this.buildRequestContext(),
        userId,
        traits,
      }),
      anonymousId,
    };
  }

  public async sendIdentifyEvent(
    userId: string,
    traits: Traits,
    options?: SendEventOptions
  ) {
    const identifyEvent = this.createIdentifyEvent(userId, traits, options);

    const response = await this.upsertManyProfiles(
      {
        events: [identifyEvent],
      },
      options
    );
    if (Array.isArray(response) && response.length === 1) {
      return response[0];
    } else {
      throw new Error(
        'Sending Identify Event failed. There was no profile returned by Server.'
      );
    }
  }

  public createTrackEvent(
    userId: string,
    event: string,
    properties?: Properties,
    options?: SendEventOptions
  ): TrackEvent & { anonymousId: string } {
    const messageId = uuid();
    const anonymousId = options?.anonymousId || userId;
    const timestamp = options?.timestamp || Date.now();
    return {
      ...buildTrackEvent({
        messageId,
        timestamp,
        ctx: this.buildRequestContext(),
        event,
        properties: properties || {},
      }),
      anonymousId,
    };
  }

  public async sendTrackEvent(
    userId: string,
    event: string,
    properties?: Properties,
    options?: SendEventOptions
  ) {
    const trackEvent = this.createTrackEvent(
      userId,
      event,
      properties,
      options
    );

    const response = await this.upsertManyProfiles(
      { events: [trackEvent] },
      options
    );

    if (Array.isArray(response) && response.length === 1) {
      return response[0];
    } else {
      throw new Error(
        'Sending Track Event failed. There was no profile returned by Server.'
      );
    }
  }

  private buildRequestContext() {
    const ctx: NinetailedRequestContext = {
      url: '',
      referrer: '',
      locale: '',
      userAgent: '',
    };
    return ctx;
  }
}
