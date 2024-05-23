/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Analytics, AnalyticsInstance } from 'analytics';
import {
  FEATURES,
  SET_ENABLED_FEATURES,
} from '@ninetailed/experience.js-shared';
import {
  DEFAULT_ACCEPTED_CONSENT_CONFIG,
  DEFAULT_PRIVACY_CONFIG,
  NinetailedPrivacyPlugin,
  PrivacyConfig,
} from './NinetailedPrivacyPlugin';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { sleep } from 'radash';

class TestPlugin extends NinetailedPlugin {
  public name = 'ninetailed';

  public page = jest.fn();

  public [SET_ENABLED_FEATURES] = jest.fn();
}

const setup = (
  config?: Partial<PrivacyConfig>,
  afterConsentConfig?: Partial<PrivacyConfig>
) => {
  const testPlugin = new TestPlugin();
  const privacyPlugin = new NinetailedPrivacyPlugin(config, afterConsentConfig);
  const analytics = Analytics({
    plugins: [testPlugin, privacyPlugin],
  });

  return { analytics, testPlugin, privacyPlugin };
};

describe('NinetailedPrivacyPlugin', () => {
  let analytics: AnalyticsInstance;
  let testPlugin: TestPlugin;
  let privacyPlugin: NinetailedPrivacyPlugin;

  beforeEach(async () => {
    const setupResult = setup();
    analytics = setupResult.analytics;
    testPlugin = setupResult.testPlugin;
    privacyPlugin = setupResult.privacyPlugin;

    await sleep(1);

    // @ts-expect-error
    await privacyPlugin.consent(false);
    // I'm not sure why we need the sleep here. The localstorage write should be synchronous.
    await sleep(1);
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
    // I'm not sure why we need the sleep here. The localstorage write should be synchronous.
    await sleep(1);

    // @ts-expect-error
    expect(privacyPlugin.isConsentGiven()).toBeTruthy();
  });

  it('Should allow Pageview events if the config sets it as allowedEvents', async () => {
    await analytics.page();

    expect(testPlugin.page).toHaveBeenCalled();
  });

  it('Should intercept Pageview events', async () => {
    const { testPlugin } = setup({ allowedEvents: [] });

    await analytics.page();

    expect(testPlugin.page).not.toHaveBeenCalled();
  });

  it("should intercept page events, if the after consent config won't allow them", async () => {
    const { testPlugin, privacyPlugin, analytics } = setup(
      {},
      { allowedEvents: [] }
    );

    // await sleep(1);

    await analytics.page();
    expect(testPlugin.page).toHaveBeenCalled();

    // @ts-expect-error
    await privacyPlugin.consent(true);
    // I'm not sure why we need the sleep here. The localstorage write should be synchronous.
    await sleep(1);

    testPlugin.page.mockClear();

    await analytics.page();
    expect(testPlugin.page).not.toHaveBeenCalled();
  });

  it('Should set the features which are used correctly. E.g. not using the location of the user, even if the consent is given', async () => {
    const { testPlugin, privacyPlugin } = setup(
      { enabledFeatures: [] },
      { enabledFeatures: [FEATURES.IP_ENRICHMENT] }
    );

    await sleep(1);

    expect(testPlugin[SET_ENABLED_FEATURES]).toHaveBeenCalledTimes(1);
    expect(testPlugin[SET_ENABLED_FEATURES]).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({
          features: [],
        }),
      })
    );

    // @ts-expect-error
    await privacyPlugin.consent(true);

    // It's not clear why we need the sleep here. Awaiting the dispatch in the consent method should be enough.
    await sleep(1);

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
