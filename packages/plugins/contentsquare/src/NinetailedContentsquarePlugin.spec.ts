import { Ninetailed } from '@ninetailed/experience.js';
import { fixtures } from '@ninetailed/experience.js-plugin-analytics/test';
import { sleep } from '@ninetailed/testing-utils/sleep';

import { NinetailedContentsquarePlugin } from './NinetailedContentsquarePlugin';

const setup = () => {
  const contentsquarePlugin = new NinetailedContentsquarePlugin();
  const ninetailed = new Ninetailed(
    { clientId: 'test' },
    { plugins: [contentsquarePlugin] }
  );

  return { ninetailed, contentsquarePlugin };
};

describe('NinetailedContentsquarePlugin', () => {
  let ninetailed: Ninetailed;

  beforeEach(() => {
    ({ ninetailed } = setup());
  });

  it('should be defined', () => {
    expect(NinetailedContentsquarePlugin).toBeDefined();
  });

  it('should be instantiable', () => {
    const plugin = new NinetailedContentsquarePlugin();

    expect(plugin).toBeInstanceOf(NinetailedContentsquarePlugin);
  });

  it('should add the sent events to the ninetailed.plugins.contentsquare.dataLayer', async () => {
    await ninetailed.trackComponentView(
      fixtures.TRACK_COMPONENT_VIEW_PROPERTIES
    );

    await sleep(5);
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).ninetailed.plugins.contentsquare.dataLayer
    ).toHaveLength(1);
    expect(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).ninetailed.plugins.contentsquare.dataLayer[0]
    ).toEqual({
      event: 'nt_experience',
      variant: 'variant 1',
      experience: 'test',
      audience: 'test',
      component: 'test',
    });
  });
});
