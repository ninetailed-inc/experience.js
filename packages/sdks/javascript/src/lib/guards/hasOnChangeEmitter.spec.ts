import { OnChangeEmitter } from '../utils/OnChangeEmitter';
import { hasOnChangeEmitter } from './hasOnChangeEmitter';

describe('hasOnChangeEmitter', () => {
  it('should return true if the argument has an onChangeEmitter property with the correct constructor', () => {
    const arg = {
      onChangeEmitter: new OnChangeEmitter(),
    };
    expect(hasOnChangeEmitter(arg)).toBe(true);
  });

  it('should return false if the argument has an onChangeEmitter property with the incorrect constructor', () => {
    const arg = {
      onChangeEmitter: {},
    };
    expect(hasOnChangeEmitter(arg)).toBe(false);
  });

  it('should return false if the argument does not have an onChangeEmitter property', () => {
    const arg = {};
    expect(hasOnChangeEmitter(arg)).toBe(false);
  });
});
