import { LogEvent } from 'diary';

import { LogSink } from './LogSink';

export type OnErrorHandler = (
  message: string | Error,
  ...args: unknown[]
) => void;

export class OnErrorLogSink implements LogSink {
  public name = 'OnErrorLogSink';

  constructor(private readonly onError: OnErrorHandler) {}

  ingest(event: LogEvent): void {
    if (!event.messages.length) {
      return;
    }

    if (event.level === 'error' || event.level === 'fatal') {
      if (
        event.messages[0] instanceof Error ||
        typeof event.messages[0] === 'string'
      ) {
        this.onError(event.messages[0], ...event.messages.slice(1));
      }
    }
  }
}
