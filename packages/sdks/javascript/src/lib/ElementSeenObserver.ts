import type { ObserveOptions } from './types/ObserveOptions';

export type ElementSeenObserverOptions = {
  onElementSeen: (element: Element, delay?: number) => void;
};

export type { ObserveOptions } from './types/ObserveOptions';

export class ElementSeenObserver {
  private _intersectionObserver?: IntersectionObserver;
  private _elementDelays: WeakMap<Element, number[]>;
  private _intersectionTimers: WeakMap<Element, number[]>;

  constructor(private _options: ElementSeenObserverOptions) {
    this._elementDelays = new WeakMap<Element, number[]>();
    this._intersectionTimers = new WeakMap<Element, number[]>();

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
        const delays = this._elementDelays.get(target);

        delays?.forEach((delay) => {
          const timeOut = window.setTimeout(() => {
            this._options.onElementSeen(target, delay);
          }, delay);
          const currentTimers = this._intersectionTimers.get(target) || [];
          this._intersectionTimers.set(target, [...currentTimers, timeOut]);
        });
      } else {
        const timeOuts = this._intersectionTimers.get(target);
        timeOuts?.forEach((timeOut) => {
          if (typeof timeOut !== 'undefined') {
            window.clearTimeout(timeOut);
          }
        });
      }
    });
  }

  public observe(element: Element, options?: ObserveOptions) {
    const delays = this._elementDelays.get(element) || [];

    this._elementDelays.set(
      element,
      Array.from(new Set([...delays, options?.delay || 0]))
    );
    this._intersectionObserver?.observe(element);
  }

  public unobserve(element: Element) {
    this._intersectionObserver?.unobserve(element);
  }
}
