import { Ninetailed } from '@ninetailed/experience.js';
import { fixtures } from '@ninetailed/experience.js-plugin-analytics/test';
import { sleep } from '@ninetailed/testing-utils/sleep';

import { NinetailedGoogleAnalyticsPlugin } from './NinetailedGoogleAnalyticsPlugin';

const setup = () => {
  const googleAnalyticsPlugin = new NinetailedGoogleAnalyticsPlugin();
  const ninetailed = new Ninetailed(
    { clientId: 'test' },
    { plugins: [googleAnalyticsPlugin] }
  );

  const gtag = jest.fn();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.gtag = gtag;

  return { ninetailed, gtag };
};

describe('NinetailedGoogleAnalyticsPlugin', () => {
  let ninetailed: Ninetailed;
  let gtag: jest.Mock;

  beforeEach(() => {
    ({ ninetailed, gtag } = setup());
  });

  it('should be defined', () => {
    expect(NinetailedGoogleAnalyticsPlugin).toBeDefined();
  });

  it('should be instantiable', () => {
    const plugin = new NinetailedGoogleAnalyticsPlugin();

    expect(plugin).toBeInstanceOf(NinetailedGoogleAnalyticsPlugin);
  });

  it('should send has_seen_component events to google analytics', async () => {
    await ninetailed.trackHasSeenComponent(fixtures.TRACK_COMPONENT_PROPERTIES);

    await sleep(5);
    expect(gtag).toBeCalledTimes(1);
    expect(gtag).toBeCalledWith('event', 'Has Seen Component - Audience:test', {
      category: 'Ninetailed',
      label: 'Variant:test',
      nonInteraction: true,
    });
  });
});
