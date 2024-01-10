import { logger } from '../logger/Logger';
import type { FetchImpl } from './FetchImpl';

export type RequestInitWithTimeout = RequestInit & {
  timeout: number;
  onTimeout?: () => void;
};

export const fetchTimeout = async (
  url: string,
  init: RequestInitWithTimeout,
  { fetchImpl = fetch }: { fetchImpl?: FetchImpl } = {}
) => {
  const { timeout, onTimeout } = init;

  const controller = new AbortController();

  const id = setTimeout(() => {
    if (typeof onTimeout === 'function') {
      logger.error(new Error('Ninetailed Request timed out.'));
    }

    controller.abort();
  }, timeout);

  const response = await fetchImpl(url, {
    ...init,
    signal: controller.signal,
  });

  clearTimeout(id);
  return response;
};
