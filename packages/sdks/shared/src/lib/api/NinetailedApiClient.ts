import retry from 'async-retry';
import {
  CreateProfileRequestBody,
  CreateProfileResponse,
} from '../types/Endpoints/CreateProfile';
import {
  UpdateProfileRequestBody,
  UpdateProfileResponse,
} from '../types/Endpoints/UpdateProfile';
import {
  UpsertManyProfilesRequestBody,
  UpsertManyProfilesResponse,
} from '../types/Endpoints/UpsertManyProfiles';
import { ProfileWithSelectedVariants } from '../types/SelectedVariantInfo/ProfileWithSelectedVariants';
import type { Event } from '../types/Event/Event';

import { logger } from '../logger/Logger';
import { fetchTimeout } from './fetch-timeout';
import { FetchImpl } from './FetchImpl';
import { RequestBodyOptions } from '../types/Endpoints/RequestBodyOptions';
import { GetProfileResponse } from '../types/Endpoints/GetProfile';

const BASE_URL = 'https://experience.ninetailed.co';

export type NinetailedApiClientOptions = {
  clientId: string;
  environment?: string;

  preview?: boolean;

  url?: string;

  /**
   * The NinetailedAPIClient can be used on browser, node.js, edge workers etc
   * fecth is not available on all those environments.
   * The fetchImpl option makes it possible for e.x. node.js to pass the node-fetch
   * package implementation of fetch to the request.
   */
  fetchImpl?: FetchImpl;
};

export const FEATURES = {
  IP_ENRICHMENT: 'ip-enrichment',
  LOCATION: 'location',
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

type RequestOptions = {
  /**
   * A timeout after which a request will get cancelled - use this especially on browser implementations
   */
  timeout?: number;
  /**
   * Setting the preflight mode will make the api aggregate a new state o the profile,
   * but not store the state.
   * This is commonly used in ESR or SSR environments
   */
  preflight?: boolean;
  /**
   * The locale parameter determines the language to which the location.city & location.country will get translated
   */
  locale?: string;
  /**
   * A ip address to override the API behavior for ip analysis (if used / activated)
   * This is commonly used in ESR or SSR environments, as the API would use the Server IP otherwise
   */
  ip?: string;
  /**
   * The Ninetailed API accepts the performance critical enpoints in plaintext.
   * By sending plaintext no CORS preflight request is needed.
   * This way the "real" request is sent ou a lot faster.
   */
  plainText?: boolean;
  /**
   * The maximum amount of retries for a request.
   * Only 503 errors will be retried. The Ninetailed API is aware of which requests are retryable and send a 503 error.
   *
   * @default 1
   */
  retries?: number;
  /**
   * The maximum amount of time in ms to wait between retries.
   * By default the retry will be sent immediately as the Ninetailed API is serverless and sends a 503 errors when it could not recover a request internally.
   * It won't be overloaded.
   *
   * @default 0 (no delay)
   */
  minRetryTimeout?: number;
  /**
   * Activated features (e.g. "ip-enrichment") which the API should use for this request.
   */
  enabledFeatures?: Feature[];
};

type CreateProfileParams = {
  events: Event[];
};

type UpdateProfileParams = {
  profileId: string;
  events: Event[];
};

type UpsertProfileParams = {
  profileId?: string;
  events: Event[];
};

type UpsertManyProfileParams = {
  events: (Event & { anonymousId: string })[];
};

export type CreateProfileRequestOptions = RequestOptions;

export type UpsertProfileRequestOptions = RequestOptions;

export type UpdateProfileRequestOptions = RequestOptions;

export type GetProfileRequestOptions = Omit<
  RequestOptions,
  'preflight' | 'plainText'
>;

export type UpsertManyProfilesRequestOptions = Pick<
  RequestOptions,
  'timeout' | 'enabledFeatures'
>;

const DEFAULT_ENVIRONMENT = 'main';

class HttpError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class NinetailedApiClient {
  private readonly clientId: string;
  private readonly environment: string;
  private readonly url: string;
  private readonly fetchImpl: FetchImpl;

  constructor({
    clientId,
    environment = DEFAULT_ENVIRONMENT,
    url = BASE_URL,
    fetchImpl = fetch,
  }: NinetailedApiClientOptions) {
    this.clientId = clientId;
    this.environment = environment;
    this.url = url;

    this.fetchImpl = fetchImpl;
  }

  private logRequestError(
    error: unknown,
    { requestName }: { requestName: string }
  ) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        logger.warn(
          `${requestName} request aborted due to network issues. This request is not retryable.`
        );
      } else {
        logger.error(
          `${requestName} request failed with error: [${error.name}] ${error.message}`
        );
      }
    }
  }

  public async upsertProfile(
    { profileId, events }: UpsertProfileParams,
    options?: UpsertProfileRequestOptions
  ) {
    if (!profileId) {
      return this.createProfile(
        {
          events,
        },
        options
      );
    } else {
      return this.updateProfile(
        {
          profileId: profileId,
          events,
        },
        options
      );
    }
  }

  private retryRequest(
    request: Promise<Response>,
    name: string,
    options: RequestOptions
  ) {
    return retry(
      async (bail) => {
        try {
          const response = await request;

          if (response.status === 503) {
            throw new HttpError(
              `${name} request failed with status: "[${response.status}] ${response.statusText}".`,
              503
            );
          }

          if (!response.ok) {
            bail(
              new Error(
                `${name} request failed with status: "[${response.status}] ${
                  response.statusText
                } - traceparent: ${response.headers.get(
                  'traceparent'
                )}". This request is not retryable`
              )
            );
            return null as unknown as Response;
          }

          logger.debug(`${name} response: `, response);

          return response;
        } catch (error) {
          if (error instanceof HttpError && error.status === 503) {
            throw error;
          }

          if (error instanceof Error) {
            bail(error);
          } else {
            bail(
              new Error(
                `${name} request failed with an unknown error. This request is not retryable.`
              )
            );
          }

          return null as unknown as Response;
        }
      },
      {
        retries: options.retries ?? 1,
        minTimeout: options.minRetryTimeout ?? 0,
        onRetry: (error, attempt) =>
          logger.error(`${error.message} Retrying (attempt ${attempt}).`),
      }
    );
  }

  private makeProfileMutationRequest(
    url: string,
    payload: unknown,
    name: string,
    options: RequestOptions
  ) {
    return this.retryRequest(
      fetchTimeout(
        this.constructUrl(url, options),
        {
          method: 'POST',
          headers: this.constructHeaders(options),
          body: JSON.stringify(payload),
          timeout: options.timeout || 3000,
        },
        { fetchImpl: this.fetchImpl }
      ),
      name,
      options
    );
  }

  public async getProfile(
    id: string,
    options: GetProfileRequestOptions = {}
  ): Promise<ProfileWithSelectedVariants> {
    const requestName = 'Get Profile';
    logger.info(`Sending ${requestName} request.`);

    try {
      const response = await this.retryRequest(
        fetchTimeout(
          this.constructUrl(
            `/v2/organizations/${this.clientId}/environments/${this.environment}/profiles/${id}`,
            options
          ),
          {
            method: 'GET',
            timeout: options.timeout || 3000,
          },
          { fetchImpl: this.fetchImpl }
        ),
        'Get Profile',
        options
      );

      const { data } = GetProfileResponse.parse(await response.json());
      logger.debug(`${requestName} request succesfully completed.`);
      return data;
    } catch (error) {
      this.logRequestError(error, { requestName });
      throw error;
    }
  }

  /**
   * Creates a profile and returns it.
   * Use the given profileId for subsequent update requests.
   * The events will be used to aggregate the new Profile state.
   */
  public async createProfile(
    { events }: CreateProfileParams,
    options: CreateProfileRequestOptions = {}
  ): Promise<ProfileWithSelectedVariants> {
    const requestName = 'Create Profile';
    logger.info(`Sending ${requestName} request.`);
    const body: CreateProfileRequestBody = {
      events,
      options: this.constructOptions(options),
    };
    logger.debug(`${requestName} request Body: `, body);

    try {
      const response = await this.makeProfileMutationRequest(
        `/v2/organizations/${this.clientId}/environments/${this.environment}/profiles`,
        body,
        'Create Profile',
        options
      );
      const { data } = CreateProfileResponse.parse(await response.json());
      logger.debug(`${requestName} request succesfully completed.`);
      return data;
    } catch (error) {
      this.logRequestError(error, { requestName });
      throw error;
    }
  }

  /**
   * Updates a profile with the given profileId.
   * The events will be used to aggregate the new Profile state.
   */
  public async updateProfile(
    { profileId, events }: UpdateProfileParams,
    options: UpdateProfileRequestOptions = {}
  ): Promise<ProfileWithSelectedVariants> {
    const requestName = 'Update Profile';
    logger.info(`Sending ${requestName} request.`);
    const body: UpdateProfileRequestBody = {
      events,
      options: this.constructOptions(options),
    };
    logger.debug(`${requestName} request Body: `, body);

    try {
      const response = await this.makeProfileMutationRequest(
        `/v2/organizations/${this.clientId}/environments/${this.environment}/profiles/${profileId}`,
        body,
        requestName,
        options
      );

      const { data } = UpdateProfileResponse.parse(await response.json());
      logger.debug(`${requestName} request successfully completed.`);
      return data;
    } catch (error) {
      this.logRequestError(error, { requestName });
      throw error;
    }
  }

  /**
   * Sends multiple events to the Ninetailed API.
   * Every events needs to have a anonymous ID.
   * Profiles will get created or updated according to the set anonymous ID.
   *
   * This method is intended to be used from server environments.
   */
  public async upsertManyProfiles(
    { events }: UpsertManyProfileParams,
    options: UpsertManyProfilesRequestOptions = {}
  ) {
    const requestName = 'Upsert Many Profiles';
    logger.info(`Sending ${requestName} request.`);
    const body: UpsertManyProfilesRequestBody = {
      events,
      options: this.constructOptions(options),
    };
    logger.debug(`${requestName} request Body: `, body);

    try {
      const response = await this.makeProfileMutationRequest(
        `/v2/organizations/${this.clientId}/environments/${this.environment}/events`,
        body,
        requestName,
        { plainText: false, ...options }
      );

      const {
        data: { profiles },
      } = UpsertManyProfilesResponse.parse(await response.json());
      logger.debug(`${requestName} request successfully completed.`);
      return profiles;
    } catch (error) {
      this.logRequestError(error, { requestName });
      throw error;
    }
  }

  private constructUrl(path: string, options: RequestOptions) {
    const url = new URL(path, this.url);

    if (options.preflight) {
      url.searchParams.set('type', 'preflight');
    }

    if (options.locale) {
      url.searchParams.set('locale', options.locale);
    }

    return url.toString();
  }

  private constructHeaders(options: RequestOptions) {
    const headers = new Map<string, string>();

    if (options.ip) {
      headers.set('X-Force-IP', options.ip);
    }

    if (options.plainText ?? true) {
      headers.set('Content-Type', 'text/plain');
    } else {
      headers.set('Content-Type', 'application/json');
    }

    return Object.fromEntries(headers);
  }

  private constructOptions = (options: RequestOptions): RequestBodyOptions => {
    const bodyOptions: RequestBodyOptions = {};

    if (
      options.enabledFeatures &&
      Array.isArray(options.enabledFeatures) &&
      options.enabledFeatures.length > 0
    ) {
      bodyOptions.features = options.enabledFeatures;
    }

    return bodyOptions;
  };
}
