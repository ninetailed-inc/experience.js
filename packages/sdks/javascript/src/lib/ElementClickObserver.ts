export type ElementClickObserverOptions = {
  onElementClick: (element: Element) => void;
};

export class ElementClickObserver {
  private _elementHandlers: WeakMap<Element, EventListener>;

  private static readonly CLICKABLE_SELECTOR = [
    'a[href]',
    'button',
    'input:not([type="hidden"])',
    'select',
    'textarea',
    'summary',
    'label[for]',
    '[role="button"]',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="tab"]',
    '[role="checkbox"]',
    '[role="radio"]',
    '[role="switch"]',
    '[tabindex]:not([tabindex="-1"])',
    '[data-nt-clickable="true"]',
    '[onclick="true"]',
  ].join(', ');

  constructor(private _options: ElementClickObserverOptions) {
    this._elementHandlers = new WeakMap();
  }

  public observe(element: Element) {
    if (this._elementHandlers.has(element)) {
      return;
    }

    const handler = (event: Event) => {
      if (!this.findClickedClickableElement(element, event)) {
        return;
      }

      this._options.onElementClick(element);
    };

    this._elementHandlers.set(element, handler);
    element.addEventListener('click', handler);
  }

  public unobserve(element: Element) {
    const handler = this._elementHandlers.get(element);

    if (!handler) {
      return;
    }

    element.removeEventListener('click', handler);
    this._elementHandlers.delete(element);
  }

  private findClickedClickableElement(
    observedElement: Element,
    event: Event
  ): Element | null {
    const target = event.target;

    if (!(target instanceof Element)) {
      return null;
    }

    if (!observedElement.contains(target)) {
      return null;
    }

    let candidate: Element | null = target;

    while (candidate && observedElement.contains(candidate)) {
      const clickableMatch: Element | null = candidate.closest(
        ElementClickObserver.CLICKABLE_SELECTOR
      );

      if (!clickableMatch || !observedElement.contains(clickableMatch)) {
        return null;
      }

      if (this.isDisabledElement(clickableMatch)) {
        candidate = clickableMatch.parentElement;
        continue;
      }

      return clickableMatch;
    }

    return null;
  }

  private isDisabledElement(element: Element): boolean {
    if (element.hasAttribute('disabled')) {
      return true;
    }

    if (element.getAttribute('aria-disabled') === 'true') {
      return true;
    }

    if (typeof window === 'undefined' || !window.getComputedStyle) {
      return false;
    }

    return window.getComputedStyle(element).pointerEvents === 'none';
  }
}
