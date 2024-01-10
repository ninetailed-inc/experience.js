import { LogEvent, LogFn } from 'diary';

import { LogSink } from './LogSink';

export type OnLogHandler = LogFn;

export class OnLogLogSink implements LogSink {
  public name = 'OnLogLogSink';

  constructor(private readonly onLog: OnLogHandler) {}

  ingest(event: LogEvent): void {
    if (!event.messages.length) {
      return;
    }

    if (event.level == 'error' || event.level === 'fatal') {
      return;
    }

    if (typeof event.messages[0] !== 'string') {
      return;
    }

    this.onLog(event.messages[0], ...event.messages.slice(1));
  }
}
