import { OnChangeEmitter } from './OnChangeEmitter';

describe('OnChangeEmitter', () => {
  it('should invoke the listener when invokeListeners is called', () => {
    const onChangeEmitter = new OnChangeEmitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    onChangeEmitter.addListener(listener1);
    onChangeEmitter.addListener(listener2);
    onChangeEmitter.invokeListeners();

    expect(listener1).toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });

  it('should remove the listener when the returned function of addListener is called', () => {
    const onChangeEmitter = new OnChangeEmitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    const removeListener1 = onChangeEmitter.addListener(listener1);
    onChangeEmitter.addListener(listener2);
    removeListener1();
    onChangeEmitter.invokeListeners();

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalled();
  });
});
