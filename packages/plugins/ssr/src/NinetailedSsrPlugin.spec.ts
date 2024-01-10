import { NinetailedSsrPlugin } from './lib/analytics/plugin';

describe('NinetailedSsrPlugin', () => {
  it('should be instantiated with default options', () => {
    const plugin = new NinetailedSsrPlugin();

    expect(plugin.name).toEqual('ninetailed:ssr');
  });
});
