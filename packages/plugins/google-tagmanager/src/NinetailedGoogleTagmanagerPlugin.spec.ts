import { Ninetailed } from '@ninetailed/experience.js';
import { Template } from '@ninetailed/experience.js-plugin-analytics';
import { fixtures } from '@ninetailed/experience.js-plugin-analytics/test';
import { sleep } from '@ninetailed/testing-utils/sleep';

import { NinetailedGoogleTagmanagerPlugin } from './NinetailedGoogleTagmanagerPlugin';

const setup = (template: Template = {}) => {
  const googleTagmanagerPlugin = new NinetailedGoogleTagmanagerPlugin({
    template,
  });
  const ninetailed = new Ninetailed(
    { clientId: 'test' },
    { plugins: [googleTagmanagerPlugin] }
  );

  return { ninetailed, googleTagmanagerPlugin };
};

describe('NinetailedGoogleTagmanagerPlugin', () => {
  let ninetailed: Ninetailed;

  beforeEach(() => {
    window.dataLayer = [];
    ({ ninetailed } = setup());
  });

  it('should be defined', () => {
    expect(NinetailedGoogleTagmanagerPlugin).toBeDefined();
  });

  it('should be instantiable', () => {
    const plugin = new NinetailedGoogleTagmanagerPlugin();

    expect(plugin).toBeInstanceOf(NinetailedGoogleTagmanagerPlugin);
  });

  it('should add the has_seen_element events to the window.dataLayer', async () => {
    await ninetailed.trackComponentView(
      fixtures.TRACK_COMPONENT_VIEW_PROPERTIES
    );

    await sleep(5);
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer && window.dataLayer[0]).toMatchSnapshot();
  });

  it('should add the has_seen_component events to the window.dataLayer', async () => {
    await ninetailed.trackHasSeenComponent(fixtures.TRACK_COMPONENT_PROPERTIES);

    await sleep(5);
    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer && window.dataLayer[0]).toEqual({
      event: 'Has Seen Experience',
      properties: {
        category: 'Ninetailed',
        label: 'Variant:test',
        nonInteraction: true,
      },
    });
  });

  describe('template options', () => {
    it('should not override predefined keys', async () => {
      ({ ninetailed } = setup({ ninetailed_experience: 'myKey' }));

      await ninetailed.trackComponentView(
        fixtures.TRACK_COMPONENT_VIEW_PROPERTIES
      );

      await sleep(5);
      expect(window.dataLayer).toHaveLength(1);
      expect(
        window.dataLayer && (window.dataLayer[0] as any).ninetailed_experience
      ).toEqual(fixtures.TRACK_COMPONENT_VIEW_PROPERTIES.experience.id);
    });
  });
});
