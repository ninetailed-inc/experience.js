import type { ObserveOptions } from './types/ObserveOptions';

export type ElementSeenObserverOptions = {
  onElementSeen: (
    element: Element,
    delay: number,
    viewDurationMs: number,
    viewId: string
  ) => void;
};

export type { ObserveOptions } from './types/ObserveOptions';

type ElementViewState = {
  delays: Set<number>;
  isIntersecting: boolean;
  viewId: string | null;
  sessionStartTimestamp: number | null;
  startedDelays: Set<number>;
  pendingStartTimers: Map<number, number>;
};

export class ElementSeenObserver {
  private _intersectionObserver?: IntersectionObserver;
  private _elementViewState: Map<Element, ElementViewState>;

  constructor(private _options: ElementSeenObserverOptions) {
    this._elementViewState = new Map();

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

      viewState.isIntersecting = isIntersecting;

      if (isIntersecting) {
        if (viewState.sessionStartTimestamp === null) {
          this.startSession(target, viewState, now);
        }
        return;
      }

      this.endSession(target, viewState, now);
    });
  }

  public observe(element: Element, options?: ObserveOptions) {
    const delay = Math.max(0, options?.delay ?? 0);
    const viewState = this._elementViewState.get(element);

    if (!viewState) {
      this._elementViewState.set(element, {
        delays: new Set([delay]),
        isIntersecting: false,
        viewId: null,
        sessionStartTimestamp: null,
        startedDelays: new Set(),
        pendingStartTimers: new Map(),
      });
    } else if (!viewState.delays.has(delay)) {
      viewState.delays.add(delay);
      this.scheduleDelayStart(element, viewState, delay);
    }

    this._intersectionObserver?.observe(element);
  }

  public unobserve(element: Element) {
    const viewState = this._elementViewState.get(element);

    if (viewState) {
      this.endSession(element, viewState, Date.now());
    }

    this._elementViewState.delete(element);
    this._intersectionObserver?.unobserve(element);
  }

  /**
   * Ends every active view session immediately (e.g. on tab hide) so a final
   * view event is emitted rather than left dangling.
   */
  public endActiveSessions() {
    const now = Date.now();

    this._elementViewState.forEach((viewState, element) => {
      if (viewState.sessionStartTimestamp !== null) {
        this.endSession(element, viewState, now);
      }
    });
  }

  /**
   * Restarts a view session for elements that are still intersecting after
   * a tab returns to the foreground. Produces a fresh viewId.
   */
  public resumeActiveSessions() {
    const now = Date.now();

    this._elementViewState.forEach((viewState, element) => {
      if (
        viewState.isIntersecting &&
        viewState.sessionStartTimestamp === null
      ) {
        this.startSession(element, viewState, now);
      }
    });
  }

  private startSession(
    element: Element,
    viewState: ElementViewState,
    now: number
  ) {
    viewState.viewId = crypto.randomUUID();
    viewState.sessionStartTimestamp = now;
    viewState.startedDelays = new Set();
    viewState.pendingStartTimers = new Map();

    viewState.delays.forEach((delay) => {
      this.scheduleDelayStart(element, viewState, delay);
    });
  }

  private scheduleDelayStart(
    element: Element,
    viewState: ElementViewState,
    delay: number
  ) {
    if (viewState.sessionStartTimestamp === null) {
      return;
    }

    const elapsed = Date.now() - viewState.sessionStartTimestamp;
    const remaining = delay - elapsed;

    if (remaining <= 0) {
      this.emitStart(element, viewState, delay);
      return;
    }

    const timerId = window.setTimeout(() => {
      viewState.pendingStartTimers.delete(delay);
      this.emitStart(element, viewState, delay);
    }, remaining);

    viewState.pendingStartTimers.set(delay, timerId);
  }

  private emitStart(
    element: Element,
    viewState: ElementViewState,
    delay: number
  ) {
    if (
      viewState.sessionStartTimestamp === null ||
      viewState.startedDelays.has(delay)
    ) {
      return;
    }

    viewState.startedDelays.add(delay);
    this._options.onElementSeen(element, delay, 0, viewState.viewId as string);
  }

  private endSession(
    element: Element,
    viewState: ElementViewState,
    now: number
  ) {
    viewState.pendingStartTimers.forEach((timerId) => {
      window.clearTimeout(timerId);
    });
    viewState.pendingStartTimers.clear();

    if (viewState.sessionStartTimestamp === null) {
      return;
    }

    const viewDurationMs = now - viewState.sessionStartTimestamp;
    const viewId = viewState.viewId as string;

    viewState.startedDelays.forEach((delay) => {
      this._options.onElementSeen(element, delay, viewDurationMs, viewId);
    });

    viewState.startedDelays.clear();
    viewState.sessionStartTimestamp = null;
    viewState.viewId = null;
  }
}
