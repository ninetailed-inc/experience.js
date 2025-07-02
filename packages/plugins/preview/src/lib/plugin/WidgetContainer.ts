const CONTAINER_WIDTH = 432;
const BUTTON_WIDTH = 48;
const BUTTON_HEIGHT = 192;
const BUTTON_BOTTOM_POSITION = 128;

const TRANSFORM_CLOSED = `translate(${CONTAINER_WIDTH - BUTTON_WIDTH}px, 0px)`;
const TRANSFORM_CLOSED_HIDE = `translate(${CONTAINER_WIDTH}px, 0px)`;
const TRANSFORM_OPEN = `translate(0px, 0px)`;

export type WidgetContainerOptions = {
  ui?: {
    opener?: {
      hide: boolean;
    };
  };
};

export class WidgetContainer {
  private static CONTAINER_CLASS = 'nt-preview-widget-container';
  private readonly container: HTMLDivElement;

  constructor(private readonly options: WidgetContainerOptions) {
    this.container = document.createElement('div');
    this.container.classList.add(WidgetContainer.CONTAINER_CLASS);
    this.container.style.position = 'fixed';
    this.container.style.zIndex = '999999';
    this.container.style.right = '0px';
    this.container.style.bottom = `${BUTTON_BOTTOM_POSITION}px`;
    this.container.style.width = `${CONTAINER_WIDTH}px`;
    this.container.style.height = `${BUTTON_HEIGHT}px`;
    this.container.style.overflow = 'hidden';
    if (options.ui?.opener?.hide) {
      this.container.style.transform = TRANSFORM_CLOSED_HIDE;
    } else {
      this.container.style.transform = TRANSFORM_CLOSED;
    }
    this.container.style.transitionTimingFunction =
      'cubic-bezier(0.4, 0, 0.2, 1)';
    this.container.style.transitionDuration = '700ms';
    this.container.style.transitionProperty = 'transform';
    document.body.appendChild(this.container);
  }

  public open() {
    this.container.style.transform = TRANSFORM_OPEN;
    this.container.style.height = '100vh';
    this.container.style.bottom = `0px`;
  }

  public close() {
    if (this.options.ui?.opener?.hide) {
      this.container.style.transform = TRANSFORM_CLOSED_HIDE;
    } else {
      this.container.style.transform = TRANSFORM_CLOSED;
    }
    setTimeout(() => {
      this.container.style.height = `${BUTTON_HEIGHT}px`;
      this.container.style.bottom = `${BUTTON_BOTTOM_POSITION}px`;
    }, 700);
  }

  public get element() {
    return this.container;
  }

  public static isContainerAttached() {
    return (
      document.querySelector(`.${WidgetContainer.CONTAINER_CLASS}`) !== null
    );
  }
}
