import { setTimeout as sleep } from 'node:timers/promises';
import { Ninetailed } from '@ninetailed/experience.js';

import { NinetailedGoogleTagmanagerPlugin } from '@ninetailed/experience.js-plugin-google-tagmanager';
import { NinetailedInsightsPlugin } from '@ninetailed/experience.js-plugin-insights';
import { NinetailedSegmentPlugin } from '@ninetailed/experience.js-plugin-segment';
import { ComponentViewEventComponentType } from '@ninetailed/experience.js-plugin-analytics';

const setup = () => {
  const gtmPlugin = new NinetailedGoogleTagmanagerPlugin();
  const insightsPlugin = new NinetailedInsightsPlugin();
  const segmentPlugin = new NinetailedSegmentPlugin();

  const ninetailed = new Ninetailed(
    { clientId: 'test' },
    { plugins: [gtmPlugin, insightsPlugin, segmentPlugin] }
  );

  return { ninetailed, gtmPlugin, insightsPlugin, segmentPlugin };
};

describe('A Ninetailed setup with multiple analytics plugins', () => {
  let ninetailed: Ninetailed;
  let insightsPlugin: NinetailedInsightsPlugin;

  beforeEach(() => {
    ({ ninetailed, insightsPlugin } = setup());
  });

  describe('Sending component views directly', () => {
    it('should send a component view event to all analytics plugins', async () => {
      await ninetailed.trackComponentView({
        experience: { id: 'experience-1', name: 'test', type: 'nt_experiment' },
        variant: { id: 'variant-1', name: 'test' },
        audience: { id: 'audience-1', name: 'test' },
        componentType: ComponentViewEventComponentType.Entry,
        element: document.createElement('div'),
        variantIndex: 1,
      });
      await sleep(5);

      // check if GTM was called e2e
      expect(window.dataLayer).toHaveLength(1);
      expect(window.dataLayer && window.dataLayer[0]).toMatchSnapshot();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const eventsQueue = insightsPlugin.events;
      expect(eventsQueue).toHaveLength(1);
    });
  });
});
