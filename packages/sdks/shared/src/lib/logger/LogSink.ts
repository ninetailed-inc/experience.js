import { LogEvent } from 'diary';

export interface LogSink {
  name: string;

  ingest(event: LogEvent): void;
}
