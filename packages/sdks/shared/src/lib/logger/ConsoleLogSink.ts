import { LogEvent } from 'diary';
import { LogSink } from './LogSink';

export class ConsoleLogSink implements LogSink {
  public name = 'ConsoleLogSink';

  ingest(event: LogEvent): void {
    const consoleLogMap = {
      debug: console.debug,
      info: console.info,
      log: console.log,
      warn: console.warn,
      error: console.error,
      fatal: console.error,
    };

    const logFn = consoleLogMap[event.level];
    if (logFn) {
      logFn(...event.messages);
    }
  }
}
