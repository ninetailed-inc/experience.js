import { OnChangeEmitter } from '../utils/OnChangeEmitter';
import { selectPluginsHavingOnChangeEmitter } from './selectPluginsHavingOnChangeEmitter';

describe('selectPluginsHavingOnChangeEmitter', () => {
  it('should return an array of plugins that have an onChangeEmitter property with the correct constructor', () => {
    const plugin1 = {
      onChangeEmitter: new OnChangeEmitter(),
    };
    const plugin2 = {
      onChangeEmitter: new OnChangeEmitter(),
    };
    const plugin3 = {};

    const plugins = [plugin1, plugin2, plugin3];

    expect(selectPluginsHavingOnChangeEmitter(plugins as any)).toEqual([
      plugin1,
      plugin2,
    ]);
  });
});
