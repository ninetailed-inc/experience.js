export type OnChangeListener = () => void;

export type RemoveOnChangeListener = () => void;

export class OnChangeEmitter {
  private onChangeListeners: OnChangeListener[] = [];

  public addListener(listener: OnChangeListener): RemoveOnChangeListener {
    this.onChangeListeners.push(listener);

    return () => {
      this.removeOnChangeListener(listener);
    };
  }

  public invokeListeners() {
    this.onChangeListeners.forEach((listener) => listener());
  }

  private removeOnChangeListener(listener: () => void) {
    this.onChangeListeners = this.onChangeListeners.filter(
      (l) => l !== listener
    );
  }
}
