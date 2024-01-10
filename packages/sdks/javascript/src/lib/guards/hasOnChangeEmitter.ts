import { HasOnChangeEmitter } from '../types/interfaces/HasOnChangeEmitter';
import { OnChangeEmitter } from '../utils/OnChangeEmitter';

export const hasOnChangeEmitter = (arg: unknown): arg is HasOnChangeEmitter => {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'onChangeEmitter' in arg &&
    typeof arg.onChangeEmitter === 'object' &&
    arg.onChangeEmitter !== null &&
    arg.onChangeEmitter.constructor === OnChangeEmitter
  );
};
