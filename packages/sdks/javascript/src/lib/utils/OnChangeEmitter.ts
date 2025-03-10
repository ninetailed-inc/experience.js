export type OnChangeListener = () => void;

export type RemoveOnChangeListener = () => void;

export class OnChangeEmitter {
  private onChangeListeners: OnChangeListener[] = [];

  public addListener(listener: OnChangeListener): RemoveOnChangeListener {
    console.log('Adding listener', listener);
    this.onChangeListeners.push(listener);

    return () => {
      this.removeOnChangeListener(listener);
    };
  }

  public invokeListeners() {
    console.log('Invoking listeners', this.onChangeListeners.length);
    this.onChangeListeners.forEach((listener) => listener());
  }

  private removeOnChangeListener(listener: () => void) {
    console.log('Removing listener', listener);
    this.onChangeListeners = this.onChangeListeners.filter(
      (l) => l !== listener
    );
  }
}
