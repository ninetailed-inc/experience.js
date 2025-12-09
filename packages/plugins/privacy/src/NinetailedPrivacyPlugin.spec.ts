/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Analytics, AnalyticsInstance } from 'analytics';
import {
  PLUGIN_NAME as NINETAILED_CORE_PLUGIN_NAME,
  SET_ENABLED_FEATURES,
} from '@ninetailed/experience.js';
import { FEATURES } from '@ninetailed/experience.js-shared';
import {
  DEFAULT_ACCEPTED_CONSENT_CONFIG,
  DEFAULT_PRIVACY_CONFIG,
  NinetailedPrivacyPlugin,
  PrivacyConfig,
} from './NinetailedPrivacyPlugin';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { waitFor } from '@testing-library/dom';

class TestPlugin extends NinetailedPlugin {
  public name = NINETAILED_CORE_PLUGIN_NAME;

  public page = jest.fn();

  public track = jest.fn();

  public [SET_ENABLED_FEATURES] = jest.fn();
}

const setup = (
  config?: Partial<PrivacyConfig>,
  afterConsentConfig?: Partial<PrivacyConfig>
) => {
  return new Promise<{
    analytics: AnalyticsInstance;
    testPlugin: TestPlugin;
    privacyPlugin: NinetailedPrivacyPlugin;
  }>((resolve) => {
    const testPlugin = new TestPlugin();
    const privacyPlugin = new NinetailedPrivacyPlugin(
      config,
      afterConsentConfig
    );
    const analytics = Analytics({
      plugins: [testPlugin, privacyPlugin],
    });

    analytics.once('ready', () => {
      // We resolve once the analytics instance is ready to ensure plugins are properly initialized and their _instance properties are set.
      resolve({ analytics, testPlugin, privacyPlugin });
    });
  });
};

describe('NinetailedPrivacyPlugin', () => {
  let analytics: AnalyticsInstance;
  let testPlugin: TestPlugin;
  let privacyPlugin: NinetailedPrivacyPlugin;

  beforeEach(async () => {
    const setupResult = await setup();
    analytics = setupResult.analytics;
    testPlugin = setupResult.testPlugin;
    privacyPlugin = setupResult.privacyPlugin;

    // @ts-expect-error
    await privacyPlugin.consent(false);
  });

  it('Should be able to instantiate with default configs', () => {
    const plugin = new NinetailedPrivacyPlugin();

    expect(plugin).toBeDefined();

    // @ts-expect-error
    expect(plugin.config).toEqual(DEFAULT_PRIVACY_CONFIG);
    // @ts-expect-error
    expect(plugin.acceptedConsentConfig).toEqual(
      DEFAULT_ACCEPTED_CONSENT_CONFIG
    );
  });

  it('Should be able to instantiate with custom configs', () => {
    const customConfig = {
      allowedEvents: ['page' as const, 'track' as const],
      allowedPageEventProperties: ['*'],
      allowedTrackEventProperties: ['*'],
      allowedTrackEvents: ['*'],
      allowedTraits: ['*'],
      blockProfileMerging: false,
      enabledFeatures: Object.values(FEATURES),
    };
    const plugin = new NinetailedPrivacyPlugin(customConfig);

    expect(plugin).toBeDefined();

    // @ts-expect-error
    expect(plugin.config).toEqual({
      ...DEFAULT_PRIVACY_CONFIG,
      ...customConfig,
    });
    // @ts-expect-error
    expect(plugin.acceptedConsentConfig).toEqual(
      DEFAULT_ACCEPTED_CONSENT_CONFIG
    );
  });

  it('Should correctly accept consent', async () => {
    // @ts-expect-error
    await privacyPlugin.consent(true);

    await waitFor(() => {
      // @ts-expect-error
      expect(privacyPlugin.isConsentGiven()).toBeTruthy();
    });
  });

  it('Should allow Pageview events if the config sets it as allowedEvents', async () => {
    await analytics.page();

    expect(testPlugin.page).toHaveBeenCalled();
  });

  it('Should intercept Pageview events', async () => {
    const { testPlugin } = await setup({ allowedEvents: [] });

    await analytics.page();

    expect(testPlugin.page).not.toHaveBeenCalled();
  });

  it("should intercept page events, if the after consent config won't allow them", async () => {
    const { testPlugin, privacyPlugin, analytics } = await setup(
      {},
      { allowedEvents: [] }
    );

    await analytics.page();

    await waitFor(() => {
      expect(testPlugin.page).toHaveBeenCalled();
    });

    // @ts-expect-error
    await privacyPlugin.consent(true);

    testPlugin.page.mockClear();

    await analytics.page();

    await waitFor(() => {
      expect(testPlugin.page).not.toHaveBeenCalled();
    });
  });

  it('should not intercept track events if all event names are allowed through *', async () => {
    const { testPlugin, analytics } = await setup({
      allowedEvents: ['track'],
      allowedTrackEvents: ['*'],
    });
    await analytics.track('test');
    expect(testPlugin.track).toHaveBeenCalled();
  });

  it('Should set the features which are used correctly. E.g. not using the location of the user, even if the consent is given', async () => {
    const { testPlugin, privacyPlugin } = await setup(
      { enabledFeatures: [] },
      { enabledFeatures: [FEATURES.IP_ENRICHMENT] }
    );

    await waitFor(() => {
      expect(testPlugin[SET_ENABLED_FEATURES]).toHaveBeenCalledTimes(1);
      expect(testPlugin[SET_ENABLED_FEATURES]).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            features: [],
          }),
        })
      );
    });

    // @ts-expect-error
    await privacyPlugin.consent(true);

    await waitFor(() => {
      expect(testPlugin[SET_ENABLED_FEATURES]).toHaveBeenCalledTimes(2);
      expect(testPlugin[SET_ENABLED_FEATURES]).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          payload: expect.objectContaining({
            features: [FEATURES.IP_ENRICHMENT],
          }),
        })
      );
    });
  });
});
