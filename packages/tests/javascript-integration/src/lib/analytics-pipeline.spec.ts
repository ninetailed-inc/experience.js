import { generateMock } from '@anatine/zod-mock';
import { TestAnalyticsPlugin } from '@ninetailed/experience.js-plugin-analytics/test';
import { Ninetailed } from '@ninetailed/experience.js';
import { waitFor } from '@testing-library/dom';
import {
  ElementSeenPayloadSchema,
  TrackComponentPropertiesSchema,
} from '@ninetailed/experience.js-plugin-analytics';

const setup = () => {
  const testAnalyticsPlugin = new TestAnalyticsPlugin({}, jest.fn(), jest.fn());
  const ninetailed = new Ninetailed(
    { clientId: 'test' },
    { plugins: [testAnalyticsPlugin] }
  );

  return { ninetailed, testAnalyticsPlugin };
};
describe('Analytics pipeline', () => {
  let ninetailed: Ninetailed;
  let testAnalyticsPlugin: TestAnalyticsPlugin;

  beforeEach(() => {
    ({ ninetailed, testAnalyticsPlugin } = setup());
  });

  it('Should be able to send track experience events which will be received from the TestAnalyticsPlugin', async () => {
    const data = {
      ...generateMock(ElementSeenPayloadSchema),
      componentType: 'Entry' as const,
      element: document.createElement('div'),
      variantIndex: 1,
    };

    await ninetailed.trackComponentView(data);

    await waitFor(() => {
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
        1
      );
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        {
          experience: data.experience,
          audience: data.audience,
          componentType: data.componentType,
          selectedVariant: data.variant,
          selectedVariantIndex: data.variantIndex,
          selectedVariantSelector: 'variant 1',
        },
        {}
      );
    });
  });

  it('Should be able to send track component events which will be received from the TestAnalyticsPlugin', async () => {
    const data = generateMock(TrackComponentPropertiesSchema);

    await ninetailed.trackHasSeenComponent(data);

    await waitFor(() => {
      expect(testAnalyticsPlugin.onTrackComponentMock).toHaveBeenCalledTimes(1);
      expect(testAnalyticsPlugin.onTrackComponentMock).toHaveBeenCalledWith(
        data
      );
    });
  });
});
