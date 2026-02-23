export type ElementHoverObserverOptions = {
  onElementHover: (element: Element, hoverDurationMs: number) => void;
  minimumHoverDurationMs?: number;
};

export class ElementHoverObserver {
  private _elementHandlers: WeakMap<
    Element,
    {
      mouseenter: EventListener;
      mouseleave: EventListener;
    }
  >;
  private _hoverStarts: WeakMap<Element, number>;

  private readonly minimumHoverDurationMs: number;

  constructor(private _options: ElementHoverObserverOptions) {
    this._elementHandlers = new WeakMap();
    this._hoverStarts = new WeakMap();
    this.minimumHoverDurationMs = _options.minimumHoverDurationMs ?? 2000;
  }

  public observe(element: Element) {
    if (this._elementHandlers.has(element)) {
      return;
    }

    const onMouseEnter = () => {
      this._hoverStarts.set(element, Date.now());
    };

    const onMouseLeave = () => {
      const hoverStartTimestamp = this._hoverStarts.get(element);
      this._hoverStarts.delete(element);

      if (typeof hoverStartTimestamp !== 'number') {
        return;
      }

      const hoverDurationMs = Date.now() - hoverStartTimestamp;

      if (hoverDurationMs < this.minimumHoverDurationMs) {
        return;
      }

      this._options.onElementHover(element, hoverDurationMs);
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
    this._hoverStarts.delete(element);
  }
}
