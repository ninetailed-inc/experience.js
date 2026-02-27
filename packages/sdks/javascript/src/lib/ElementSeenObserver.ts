import type { ObserveOptions } from './types/ObserveOptions';

export type ElementSeenObserverOptions = {
  onElementSeen: (
    element: Element,
    delay: number,
    viewDurationMs: number,
    componentViewId: string
  ) => void;
  heartbeatIntervalMs?: number;
  extendedHeartbeatIntervalMs?: number;
  extendedHeartbeatThresholdMs?: number;
  minimumHeartbeatIncrementMs?: number;
};

export type { ObserveOptions } from './types/ObserveOptions';

type ElementViewState = {
  componentViewId: string;
  delays: Set<number>;
  enterTimestamp: number | null;
  accumulatedVisibleDurationMs: number;
  lastReportedDurationByDelay: Map<number, number>;
};

type EmitViewIfNeededParams = {
  element: Element;
  viewState: ElementViewState;
  now: number;
  forceReport: boolean;
};

export class ElementSeenObserver {
  private _intersectionObserver?: IntersectionObserver;
  private _elementViewState: Map<Element, ElementViewState>;
  private _heartbeatTimer: number | null;
  private _scheduledHeartbeatIntervalMs: number | null;

  private readonly heartbeatIntervalMs: number;
  private readonly extendedHeartbeatIntervalMs: number;
  private readonly extendedHeartbeatThresholdMs: number;
  private readonly minimumHeartbeatIncrementMs: number;

  constructor(private _options: ElementSeenObserverOptions) {
    this._elementViewState = new Map();
    this._heartbeatTimer = null;
    this._scheduledHeartbeatIntervalMs = null;
    this.heartbeatIntervalMs = _options.heartbeatIntervalMs ?? 2000;
    this.extendedHeartbeatIntervalMs =
      _options.extendedHeartbeatIntervalMs ?? 10000;
    this.extendedHeartbeatThresholdMs =
      _options.extendedHeartbeatThresholdMs ?? 10000;
    this.minimumHeartbeatIncrementMs =
      _options.minimumHeartbeatIncrementMs ?? 1000;

    if (typeof IntersectionObserver !== 'undefined') {
      this._intersectionObserver = new IntersectionObserver(
        this.onIntersection.bind(this)
      );
    }
  }

  private onIntersection(entries: IntersectionObserverEntry[]) {
    const now = Date.now();

    entries.forEach((entry) => {
      const { isIntersecting, target } = entry;
      const viewState = this._elementViewState.get(target);

      if (!viewState) {
        return;
      }

      if (isIntersecting) {
        if (viewState.enterTimestamp === null) {
          viewState.enterTimestamp = now;
          this.startHeartbeatIfNeeded();
        }
        return;
      }

      this.stopTrackingVisibleTime(target, true, now);
    });
  }

  public observe(element: Element, options?: ObserveOptions) {
    const delay = Math.max(0, options?.delay ?? 0);
    const viewState = this._elementViewState.get(element);

    if (!viewState) {
      this._elementViewState.set(element, {
        componentViewId: crypto.randomUUID(),
        delays: new Set([delay]),
        enterTimestamp: null,
        accumulatedVisibleDurationMs: 0,
        lastReportedDurationByDelay: new Map(),
      });
    } else {
      viewState.delays.add(delay);
    }

    this._intersectionObserver?.observe(element);
  }

  public unobserve(element: Element) {
    this.stopTrackingVisibleTime(element, true, Date.now());
    this._elementViewState.delete(element);
    this._intersectionObserver?.unobserve(element);
    this.stopHeartbeatIfIdle();
  }

  public flushActiveViews() {
    const now = Date.now();

    this._elementViewState.forEach((viewState, element) => {
      if (viewState.enterTimestamp === null) {
        return;
      }

      this.emitViewIfNeeded({
        element,
        viewState,
        now,
        forceReport: true,
      });
    });
  }

  private runHeartbeat = () => {
    this._heartbeatTimer = null;
    this._scheduledHeartbeatIntervalMs = null;

    const now = Date.now();

    this._elementViewState.forEach((viewState, element) => {
      if (viewState.enterTimestamp === null) {
        return;
      }

      this.emitViewIfNeeded({
        element,
        viewState,
        now,
        forceReport: false,
      });
    });

    this.startHeartbeatIfNeeded();
  };

  private startHeartbeatIfNeeded() {
    if (this.getActiveViewCount() === 0) {
      this.stopHeartbeatIfIdle();
      return;
    }

    const now = Date.now();
    const heartbeatIntervalMs = this.getHeartbeatIntervalMs(now);

    if (
      this._heartbeatTimer !== null &&
      this._scheduledHeartbeatIntervalMs === heartbeatIntervalMs
    ) {
      return;
    }

    if (this._heartbeatTimer !== null) {
      window.clearTimeout(this._heartbeatTimer);
    }

    this._scheduledHeartbeatIntervalMs = heartbeatIntervalMs;
    this._heartbeatTimer = window.setTimeout(
      this.runHeartbeat,
      heartbeatIntervalMs
    );
  }

  private stopHeartbeatIfIdle() {
    if (this.getActiveViewCount() > 0 || this._heartbeatTimer === null) {
      return;
    }

    window.clearTimeout(this._heartbeatTimer);
    this._heartbeatTimer = null;
    this._scheduledHeartbeatIntervalMs = null;
  }

  private getActiveViewCount() {
    let activeViewCount = 0;

    this._elementViewState.forEach((viewState) => {
      if (viewState.enterTimestamp !== null) {
        activeViewCount += 1;
      }
    });

    return activeViewCount;
  }

  private getHeartbeatIntervalMs(now: number) {
    let hasFreshView = false;

    this._elementViewState.forEach((viewState) => {
      if (viewState.enterTimestamp === null) {
        return;
      }

      const viewDurationMs = this.getViewDurationMs(viewState, now);
      if (viewDurationMs < this.extendedHeartbeatThresholdMs) {
        hasFreshView = true;
      }
    });

    return hasFreshView
      ? this.heartbeatIntervalMs
      : this.extendedHeartbeatIntervalMs;
  }

  private stopTrackingVisibleTime(
    element: Element,
    emitFinalHeartbeat: boolean,
    now: number
  ) {
    const viewState = this._elementViewState.get(element);

    if (!viewState) {
      this.stopHeartbeatIfIdle();
      return;
    }

    if (viewState.enterTimestamp === null) {
      this.stopHeartbeatIfIdle();
      return;
    }

    viewState.accumulatedVisibleDurationMs += now - viewState.enterTimestamp;
    viewState.enterTimestamp = null;

    if (emitFinalHeartbeat) {
      this.emitViewIfNeeded({
        element,
        viewState,
        now,
        forceReport: true,
      });
    }

    this.stopHeartbeatIfIdle();
  }

  private getViewDurationMs(viewState: ElementViewState, now: number) {
    if (viewState.enterTimestamp === null) {
      return viewState.accumulatedVisibleDurationMs;
    }

    return (
      viewState.accumulatedVisibleDurationMs + (now - viewState.enterTimestamp)
    );
  }

  private emitViewIfNeeded({
    element,
    viewState,
    now,
    forceReport,
  }: EmitViewIfNeededParams) {
    const viewDurationMs = this.getViewDurationMs(viewState, now);

    viewState.delays.forEach((delay) => {
      if (viewDurationMs < delay) {
        return;
      }

      const lastReportedDurationMs =
        viewState.lastReportedDurationByDelay.get(delay) ?? 0;
      const durationDelta = viewDurationMs - lastReportedDurationMs;

      if (durationDelta <= 0) {
        return;
      }

      if (!forceReport && durationDelta < this.minimumHeartbeatIncrementMs) {
        return;
      }

      this._options.onElementSeen(
        element,
        delay,
        viewDurationMs,
        viewState.componentViewId
      );
      viewState.lastReportedDurationByDelay.set(delay, viewDurationMs);
    });
  }
}
