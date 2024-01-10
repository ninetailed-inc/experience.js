import { Analytics } from 'analytics';
import { generateMock } from '@anatine/zod-mock';
import {
  AnalyticsInstance,
  ElementSeenPayloadSchema,
  HAS_SEEN_COMPONENT,
  HAS_SEEN_ELEMENT,
  TrackComponentProperties,
} from '@ninetailed/experience.js';
import { sleep } from '@ninetailed/testing-utils/sleep';

import { Template } from './NinetailedAnalyticsPlugin';
import { TestAnalyticsPlugin } from '../../test';

const setup = (template: Template = {}) => {
  const testAnalyticsPlugin = new TestAnalyticsPlugin(
    template,
    jest.fn(),
    jest.fn()
  );
  const analytics = Analytics({
    plugins: [testAnalyticsPlugin],
  }) as AnalyticsInstance;

  return { analytics, testAnalyticsPlugin };
};

describe('NinetailedAnalyticsPlugin', () => {
  let analytics: AnalyticsInstance;
  let testAnalyticsPlugin: TestAnalyticsPlugin;

  beforeEach(() => {
    ({ analytics, testAnalyticsPlugin } = setup());
  });

  describe('trackExperience', () => {
    it(`should receive the has_seen_element event`, async () => {
      const data = {
        ...generateMock(ElementSeenPayloadSchema),
        element: document.createElement('div'),
        variantIndex: 1,
      };

      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...data,
      });

      await sleep(5);
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
        1
      );
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        {
          experience: data.experience,
          audience: data.audience,
          selectedVariant: data.variant,
          selectedVariantIndex: 1,
          selectedVariantSelector: 'variant 1',
        },
        {}
      );
    });

    it('should not receive the has_seen_element event if the payload is wrong', async () => {
      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        foo: 'bar',
      });

      await sleep(5);
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
        0
      );
    });
  });

  describe('trackComponent', () => {
    it(`should receive the has_seen_component event`, async () => {
      const data = generateMock(TrackComponentProperties);

      await analytics.dispatch({
        type: HAS_SEEN_COMPONENT,
        ...data,
      });

      await sleep(5);
      expect(testAnalyticsPlugin.onTrackComponentMock).toHaveBeenCalledTimes(1);
      expect(testAnalyticsPlugin.onTrackComponentMock).toHaveBeenCalledWith(
        data
      );
    });

    it('should not receive the has_seen_component event if the payload is wrong', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await analytics.dispatch({
        type: HAS_SEEN_COMPONENT,
        foo: 'bar',
      });

      await sleep(5);
      expect(testAnalyticsPlugin.onTrackComponentMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('template options', () => {
    it('should use the template options', async () => {
      ({ analytics, testAnalyticsPlugin } = setup({
        ninetailed_experience_name: 'nt_experience',
      }));
      const data = {
        ...generateMock(ElementSeenPayloadSchema),
        element: document.createElement('div'),
        variantIndex: 1,
      };

      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...data,
      });

      await sleep(5);
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
        1
      );
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        {
          experience: data.experience,
          audience: data.audience,
          selectedVariant: data.variant,
          selectedVariantIndex: 1,
          selectedVariantSelector: 'variant 1',
        },
        {
          ninetailed_experience_name: 'nt_experience',
        }
      );
    });

    it('should not throw if data is not defined', async () => {
      ({ analytics, testAnalyticsPlugin } = setup({
        ninetailed_experience_name: '{{experience.a.b}}',
      }));
      const data = {
        ...generateMock(ElementSeenPayloadSchema),
        element: document.createElement('div'),
        variantIndex: 1,
      };

      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...data,
      });

      await sleep(5);
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
        1
      );
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        {
          experience: data.experience,
          audience: data.audience,
          selectedVariant: data.variant,
          selectedVariantIndex: 1,
          selectedVariantSelector: 'variant 1',
        },
        {
          ninetailed_experience_name: 'undefined',
        }
      );
    });

    it('should generate dynamic keys', async () => {
      ({ analytics, testAnalyticsPlugin } = setup({
        '{{experience.id}}': 'bar',
      }));
      const mock = generateMock(ElementSeenPayloadSchema);
      const data = {
        ...mock,
        element: document.createElement('div'),
        experience: { ...mock.experience, id: 'foo' },
        variantIndex: 1,
      };

      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...data,
      });

      await sleep(5);
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
        1
      );
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        {
          experience: data.experience,
          audience: data.audience,
          selectedVariant: data.variant,
          selectedVariantIndex: 1,
          selectedVariantSelector: 'variant 1',
        },
        {
          foo: 'bar',
        }
      );
    });

    it('should generate dynamic values', async () => {
      ({ analytics, testAnalyticsPlugin } = setup({
        foo: '{{experience.id}}',
      }));
      const mock = generateMock(ElementSeenPayloadSchema);
      const data = {
        ...mock,
        element: document.createElement('div'),
        experience: { ...mock.experience, id: 'bar' },
        variantIndex: 1,
      };

      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...data,
      });

      await sleep(5);
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
        1
      );
      expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        {
          experience: data.experience,
          audience: data.audience,
          selectedVariant: data.variant,
          selectedVariantIndex: 1,
          selectedVariantSelector: 'variant 1',
        },
        {
          foo: 'bar',
        }
      );
    });
  });
});
