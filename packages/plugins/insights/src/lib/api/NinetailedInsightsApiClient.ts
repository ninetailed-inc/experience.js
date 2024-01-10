import retry from 'async-retry';
import {
  fetchTimeout,
  logger,
  type NinetailedApiClientOptions,
} from '@ninetailed/experience.js-shared';
import { type ComponentViewEventBatch } from '../types/Event/ComponentViewEventBatch';

const BASE_URL = 'https://ingest.insights.ninetailed.co';

export type NinetailedInsightsApiClientOptions = {
  clientId: string;
  environment?: string;
  preview?: boolean;
  url?: string;
};

type RequestOptions = {
  /**
   * A timeout after which a request will get cancelled - use this especially on browser implementations
   */
  timeout?: number;
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

  useBeacon?: boolean;
};

const DEFAULT_ENVIRONMENT = 'main';

class HttpError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export class NinetailedInsightsApiClient {
  private readonly clientId: string;
  private readonly environment: string;
  private readonly url: string;

  constructor({
    clientId,
    environment = DEFAULT_ENVIRONMENT,
    url = BASE_URL,
  }: NinetailedApiClientOptions) {
    this.clientId = clientId;
    this.environment = environment;
    this.url = url;
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

  private makeRequest(
    url: string,
    payload: unknown,
    name: string,
    options: RequestOptions
  ) {
    const {
      useBeacon = false,
      timeout = 3000,
      retries = 1,
      minRetryTimeout = 0,
    } = options;

    const requestUrl = this.constructUrl(url);

    if (useBeacon) {
      const blobData = new Blob([JSON.stringify(payload)], {
        type: 'text/plain',
      });

      navigator.sendBeacon(requestUrl, blobData);

      return;
    }

    return retry(
      async (bail) => {
        try {
          const response = await fetchTimeout(requestUrl, {
            method: 'POST',
            headers: this.constructHeaders(),
            body: JSON.stringify(payload),
            timeout,
          });

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
        retries: retries,
        minTimeout: minRetryTimeout,
        onRetry: (error, attempt) =>
          logger.error(`${error.message} Retrying (attempt ${attempt}).`),
      }
    );
  }

  public async sendEventBatches(
    batches: ComponentViewEventBatch[],
    options: RequestOptions = {}
  ): Promise<void> {
    const requestName = 'Send component view batches';

    logger.info(`Sending ${requestName} request.`);

    logger.debug(`${requestName} request Body: `, batches);

    try {
      await this.makeRequest(
        `/v1/organizations/${this.clientId}/environments/${this.environment}/events`,
        batches,
        requestName,
        options
      );

      logger.debug(`${requestName} request succesfully completed.`);
    } catch (error) {
      this.logRequestError(error, { requestName });
      throw error;
    }
  }

  private constructUrl(path: string) {
    const url = new URL(path, this.url);

    return url.toString();
  }

  private constructHeaders() {
    const headers = new Map<string, string>();

    headers.set('Content-Type', 'application/json');

    return Object.fromEntries(headers);
  }
}
