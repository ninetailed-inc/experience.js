import { Analytics } from 'analytics';
import { generateMock } from '@anatine/zod-mock';
import { setTimeout as sleep } from 'node:timers/promises';
import { ElementSeenPayloadSchema } from './ElementSeenPayload';
import { Template } from './NinetailedAnalyticsPlugin';
import { TestAnalyticsPlugin } from '../../test';
import { AnalyticsInstance } from './AnalyticsInstance';
import { HAS_SEEN_COMPONENT, HAS_SEEN_ELEMENT } from './constants';
import { TrackComponentPropertiesSchema } from './TrackingProperties';

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

  const generateHasSeenElementMock = () => {
    const mock = generateMock(ElementSeenPayloadSchema);
    return {
      ...mock,
      componentType: 'Entry',
      element: document.createElement('div'),
      seenFor: testAnalyticsPlugin.getComponentViewTrackingThreshold(),
      experience: { ...mock.experience, id: 'experience-1' },
    };
  };

  describe('trackExperience', () => {
    it(`should receive the has_seen_element event`, async () => {
      const data = {
        ...generateHasSeenElementMock(),
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
          componentType: 'Entry',
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
      const data = generateMock(TrackComponentPropertiesSchema);

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
        ...generateHasSeenElementMock(),
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
          componentType: data.componentType,
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
        ...generateHasSeenElementMock(),
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
          componentType: data.componentType,
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
      const data = {
        ...generateHasSeenElementMock(),
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
          componentType: data.componentType,
          selectedVariant: data.variant,
          selectedVariantIndex: 1,
          selectedVariantSelector: 'variant 1',
        },
        {
          'experience-1': 'bar',
        }
      );
    });

    it('should generate dynamic values', async () => {
      ({ analytics, testAnalyticsPlugin } = setup({
        foo: '{{experience.id}}',
      }));
      const data = {
        ...generateHasSeenElementMock(),
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
          componentType: data.componentType,
          selectedVariant: data.variant,
          selectedVariantIndex: 1,
          selectedVariantSelector: 'variant 1',
        },
        {
          foo: 'experience-1',
        }
      );
    });
  });
});
