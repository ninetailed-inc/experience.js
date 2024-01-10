export type ElementSeenObserverOptions = {
  onElementSeen: (element: Element) => void;
};

export type ObserveOptions = {
  delay?: number;
};

export class ElementSeenObserver {
  private _intersectionObserver?: IntersectionObserver;
  private _elementDelays: WeakMap<Element, number>;
  private _intersectionTimers: WeakMap<Element, number>;

  constructor(private _options: ElementSeenObserverOptions) {
    this._elementDelays = new WeakMap<Element, number>();
    this._intersectionTimers = new WeakMap<Element, number>();

    if (typeof IntersectionObserver !== 'undefined') {
      this._intersectionObserver = new IntersectionObserver(
        this.onIntersection.bind(this)
      );
    }
  }

  private onIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      const { isIntersecting, target } = entry;

      if (isIntersecting) {
        const delay = this._elementDelays.get(target);

        const timeOut = window.setTimeout(() => {
          this._options.onElementSeen(target);
        }, delay);

        this._intersectionTimers.set(target, timeOut);
      } else {
        const timeOut = this._intersectionTimers.get(target);

        if (typeof timeOut !== 'undefined') {
          window.clearTimeout(timeOut);
        }
      }
    });
  }

  public observe(element: Element, options?: ObserveOptions) {
    this._elementDelays.set(element, options?.delay ?? 2000);
    this._intersectionObserver?.observe(element);
  }

  public unobserve(element: Element) {
    this._intersectionObserver?.unobserve(element);
  }
}
