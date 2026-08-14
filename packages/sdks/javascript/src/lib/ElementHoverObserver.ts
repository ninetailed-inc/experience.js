export type ElementHoverObserverOptions = {
  onElementHover: (
    element: Element,
    hoverDurationMs: number,
    hoverId: string
  ) => void;
  componentHoverTrackingThreshold?: number;
};

type ElementHoverSession = {
  hoverId: string;
  hoverStartTimestamp: number;
  startEmitted: boolean;
  startTimer: number | null;
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

  private readonly componentHoverTrackingThreshold: number;

  constructor(private _options: ElementHoverObserverOptions) {
    this._elementHandlers = new WeakMap();
    this._activeHoverSessions = new Map();
    this.componentHoverTrackingThreshold =
      _options.componentHoverTrackingThreshold ?? 2000;
  }

  public observe(element: Element) {
    if (this._elementHandlers.has(element)) {
      return;
    }

    const onMouseEnter = () => {
      if (this._activeHoverSessions.has(element)) {
        return;
      }

      this.startSession(element);
    };

    const onMouseLeave = () => {
      this.endSession(element, Date.now());
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
    this.endSession(element, Date.now());
  }

  /**
   * Ends every active hover session immediately (e.g. on tab hide) so a
   * final hover event is emitted rather than left dangling.
   */
  public endActiveSessions() {
    const now = Date.now();

    Array.from(this._activeHoverSessions.keys()).forEach((element) => {
      this.endSession(element, now);
    });
  }

  private startSession(element: Element) {
    const now = Date.now();
    const session: ElementHoverSession = {
      hoverId: crypto.randomUUID(),
      hoverStartTimestamp: now,
      startEmitted: false,
      startTimer: null,
    };

    this._activeHoverSessions.set(element, session);

    if (this.componentHoverTrackingThreshold <= 0) {
      this.emitStart(element, session);
      return;
    }

    session.startTimer = window.setTimeout(() => {
      session.startTimer = null;
      this.emitStart(element, session);
    }, this.componentHoverTrackingThreshold);
  }

  private emitStart(element: Element, session: ElementHoverSession) {
    if (session.startEmitted) {
      return;
    }

    session.startEmitted = true;
    this._options.onElementHover(element, 0, session.hoverId);
  }

  private endSession(element: Element, now: number) {
    const session = this._activeHoverSessions.get(element);

    if (!session) {
      return;
    }

    if (session.startTimer !== null) {
      window.clearTimeout(session.startTimer);
    }

    this._activeHoverSessions.delete(element);

    if (!session.startEmitted) {
      return;
    }

    const hoverDurationMs = now - session.hoverStartTimestamp;
    this._options.onElementHover(element, hoverDurationMs, session.hoverId);
  }
}
