import { diary, LogEvent, enable, Diary } from 'diary';

import { LogSink } from './LogSink';

export class Logger {
  public readonly name = '@ninetailed/experience.js';

  private readonly diary: Diary;
  private sinks: LogSink[] = [];

  constructor() {
    this.diary = diary(this.name, this.onLogEvent.bind(this));
    enable(this.name);
  }

  public addSink(sink: LogSink) {
    this.sinks = [
      ...this.sinks.filter((existingSink) => existingSink.name !== sink.name),
      sink,
    ];
  }

  public removeSink(name: string) {
    this.sinks = this.sinks.filter((sink) => sink.name !== name);
  }

  public removeSinks() {
    this.sinks = [];
  }

  public debug(message: string, ...args: unknown[]): void {
    this.diary.debug(message, ...args);
  }

  public info(message: string, ...args: unknown[]): void {
    this.diary.info(message, ...args);
  }

  public log(message: string, ...args: unknown[]): void {
    this.diary.log(message, ...args);
  }

  public warn(message: string, ...args: unknown[]): void {
    this.diary.warn(message, ...args);
  }

  public error(message: string | Error, ...args: unknown[]): void {
    this.diary.error(message, ...args);
  }

  public fatal(message: string | Error, ...args: unknown[]): void {
    this.diary.fatal(message, ...args);
  }

  private onLogEvent(event: LogEvent) {
    this.sinks.forEach((sink) => {
      sink.ingest(event);
    });
  }
}

export const logger = new Logger();
