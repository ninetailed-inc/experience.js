import { Ninetailed } from '@ninetailed/experience.js';
import { setTimeout as sleep } from 'node:timers/promises';
import { AnalyticsBrowser } from '@segment/analytics-next';

import { NinetailedSegmentPlugin } from './NinetailedSegmentPlugin';

const setup = () => {
  const segmentPlugin = new NinetailedSegmentPlugin();
  const ninetailed = new Ninetailed(
    { clientId: 'test' },
    { plugins: [segmentPlugin] }
  );
  const segment = AnalyticsBrowser.load({ writeKey: '<YOUR_WRITE_KEY>' });
  segment.track = jest.fn();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.analytics = segment;

  return { ninetailed, segment };
};

describe('NinetailedSegmentPlugin', () => {
  let ninetailed: Ninetailed;
  let segment: AnalyticsBrowser;

  beforeEach(() => {
    ({ ninetailed, segment } = setup());
  });

  it('should be defined', () => {
    expect(NinetailedSegmentPlugin).toBeDefined();
  });

  it('should be instantiable', () => {
    const plugin = new NinetailedSegmentPlugin();

    expect(plugin).toBeInstanceOf(NinetailedSegmentPlugin);
  });

  it('should send has seen component events to segment', async () => {
    await ninetailed.trackHasSeenComponent({
      variant: {
        id: 'test',
      },
      audience: {
        id: 'test',
      },
      isPersonalized: true,
    });

    await sleep(5);
    expect(segment.track).toBeCalledTimes(1);
    expect(segment.track).toBeCalledWith('Has Seen Component - Audience:test', {
      audience: 'test',
      category: 'Ninetailed',
      component: 'test',
      isPersonalized: true,
    });
  });
});
