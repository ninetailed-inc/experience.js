export type ElementHoverObserverOptions = {
  onElementHover: (
    element: Element,
    hoverDurationMs: number,
    componentHoverId: string
  ) => void;
  componentHoverTrackingThreshold?: number;
  heartbeatIntervalMs?: number;
  minimumHeartbeatIncrementMs?: number;
};

type ElementHoverSession = {
  componentHoverId: string;
  hoverStartTimestamp: number;
  lastReportedMs: number;
};

type EmitHoverIfNeededParams = {
  element: Element;
  hoverSession: ElementHoverSession;
  now: number;
  forceReport: boolean;
};

export class ElementHoverObserver {
  private _elementHandlers: WeakMap<
    Element,
    {
      mouseenter: EventListener;
      mouseleave: EventListener;
    }
  >;
  private _activeHoverSessions: Map<Element, ElementHoverSession>;
  private _heartbeatTimer: number | null;

  private readonly componentHoverTrackingThreshold: number;
  private readonly heartbeatIntervalMs: number;
  private readonly minimumHeartbeatIncrementMs: number;

  constructor(private _options: ElementHoverObserverOptions) {
    this._elementHandlers = new WeakMap();
    this._activeHoverSessions = new Map();
    this._heartbeatTimer = null;
    this.componentHoverTrackingThreshold =
      _options.componentHoverTrackingThreshold ?? 2000;
    this.heartbeatIntervalMs = _options.heartbeatIntervalMs ?? 2000;
    this.minimumHeartbeatIncrementMs =
      _options.minimumHeartbeatIncrementMs ?? 1000;
  }

  public observe(element: Element) {
    if (this._elementHandlers.has(element)) {
      return;
    }

    const onMouseEnter = () => {
      if (this._activeHoverSessions.has(element)) {
        return;
      }

      this._activeHoverSessions.set(element, {
        componentHoverId: crypto.randomUUID(),
        hoverStartTimestamp: Date.now(),
        lastReportedMs: 0,
      });

      this.startHeartbeatIfNeeded();
    };

    const onMouseLeave = () => {
      this.endHoverSession(element, true);
    };

    element.addEventListener('mouseenter', onMouseEnter);
    element.addEventListener('mouseleave', onMouseLeave);

    this._elementHandlers.set(element, {
      mouseenter: onMouseEnter,
      mouseleave: onMouseLeave,
    });
  }

  public unobserve(element: Element) {
    const handlers = this._elementHandlers.get(element);

    if (!handlers) {
      return;
    }

    element.removeEventListener('mouseenter', handlers.mouseenter);
    element.removeEventListener('mouseleave', handlers.mouseleave);

    this._elementHandlers.delete(element);
    this.endHoverSession(element, false);
  }

  public flushActiveHovers() {
    const now = Date.now();

    this._activeHoverSessions.forEach((hoverSession, element) => {
      this.emitHoverIfNeeded({
        element,
        hoverSession,
        now,
        forceReport: true,
      });
    });

    this._activeHoverSessions.clear();
    this.stopHeartbeatIfIdle();
  }

  private startHeartbeatIfNeeded() {
    if (this._heartbeatTimer !== null || this._activeHoverSessions.size === 0) {
      return;
    }

    this._heartbeatTimer = window.setInterval(() => {
      const now = Date.now();

      this._activeHoverSessions.forEach((hoverSession, element) => {
        this.emitHoverIfNeeded({
          element,
          hoverSession,
          now,
          forceReport: false,
        });
      });
    }, this.heartbeatIntervalMs);
  }

  private stopHeartbeatIfIdle() {
    if (this._activeHoverSessions.size > 0 || this._heartbeatTimer === null) {
      return;
    }

    window.clearInterval(this._heartbeatTimer);
    this._heartbeatTimer = null;
  }

  private endHoverSession(element: Element, emitFinalHeartbeat: boolean) {
    const hoverSession = this._activeHoverSessions.get(element);

    if (!hoverSession) {
      this.stopHeartbeatIfIdle();
      return;
    }

    if (emitFinalHeartbeat) {
      this.emitHoverIfNeeded({
        element,
        hoverSession,
        now: Date.now(),
        forceReport: true,
      });
    }

    this._activeHoverSessions.delete(element);
    this.stopHeartbeatIfIdle();
  }

  private emitHoverIfNeeded({
    element,
    hoverSession,
    now,
    forceReport,
  }: EmitHoverIfNeededParams) {
    const hoverDurationMs = now - hoverSession.hoverStartTimestamp;

    if (hoverDurationMs < this.componentHoverTrackingThreshold) {
      return;
    }

    const durationDelta = hoverDurationMs - hoverSession.lastReportedMs;

    if (durationDelta <= 0) {
      return;
    }

    if (!forceReport && durationDelta < this.minimumHeartbeatIncrementMs) {
      return;
    }

    this._options.onElementHover(
      element,
      hoverDurationMs,
      hoverSession.componentHoverId
    );
    hoverSession.lastReportedMs = hoverDurationMs;
  }
}
