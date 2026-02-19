import { Analytics } from 'analytics';
import { generateMock } from '@anatine/zod-mock';
import { waitFor } from '@testing-library/dom';
import {
  type ElementSeenPayload,
  ElementSeenPayloadSchema,
} from './ElementPayload';
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
  const generateHasSeenElementMock = (): ElementSeenPayload => {
    const mock = generateMock(ElementSeenPayloadSchema);
    return {
      ...mock,
      componentType: 'Entry',
      element: document.createElement('div'),
      seenFor: testAnalyticsPlugin.getComponentViewTrackingThreshold(),
      experience: {
        ...mock.experience,
        type: 'nt_experiment',
        id: 'experience-1',
      },
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
      await waitFor(() => {
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
    });
    it(`should call onTrackExperience multiple times when the same element is seen with different payloads`, async () => {
      // Emulates the same element being seen two times but with different payloads.
      // For example, an element is seen first as part of one experience, then reenters the viewport as part of another experience.
      const element = document.createElement('div');
      const basePayload = generateHasSeenElementMock();
      // payload1 and payload2 differ only by experience
      const payload1: ElementSeenPayload = {
        ...basePayload,
        element,
        experience: {
          ...basePayload.experience,
          id: 'experience-1',
          type: 'nt_experiment',
        },
      };
      const payload2: ElementSeenPayload = {
        ...basePayload,
        element,
        experience: {
          ...basePayload.experience,
          id: 'experience-2',
          type: 'nt_experiment',
        },
      };
      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...payload1,
      });
      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...payload2,
      });
      await waitFor(() => {
        expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
          2
        );
        expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
          {
            experience: payload1.experience,
            audience: payload1.audience,
            componentType: 'Entry',
            selectedVariant: payload1.variant,
            selectedVariantIndex: payload1.variantIndex,
            selectedVariantSelector: `variant ${payload1.variantIndex}`,
          },
          {}
        );
        expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
          {
            experience: payload2.experience,
            audience: payload2.audience,
            componentType: 'Entry',
            selectedVariant: payload2.variant,
            selectedVariantIndex: payload2.variantIndex,
            selectedVariantSelector: `variant ${payload2.variantIndex}`,
          },
          {}
        );
      });
    });
    it('should not call onTrackExperience multiple times when the same element is seen with the same payload', async () => {
      const element = document.createElement('div');
      const basePayload = generateHasSeenElementMock();
      const payload1 = {
        ...basePayload,
        element,
      };
      const payload2 = {
        ...basePayload,
        element,
      };
      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...payload1,
      });
      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        ...payload2,
      });
      await waitFor(() => {
        expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
          1
        );
        expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
          {
            experience: payload1.experience,
            audience: payload1.audience,
            componentType: 'Entry',
            selectedVariant: payload1.variant,
            selectedVariantIndex: payload1.variantIndex,
            selectedVariantSelector: `variant ${payload1.variantIndex}`,
          },
          {}
        );
      });
    });
    it('should not receive the has_seen_element event if the payload is wrong', async () => {
      await analytics.dispatch({
        type: HAS_SEEN_ELEMENT,
        foo: 'bar',
      });
      await waitFor(() => {
        expect(testAnalyticsPlugin.onTrackExperienceMock).toHaveBeenCalledTimes(
          0
        );
      });
    });
  });
  describe('trackComponent', () => {
    it(`should receive the has_seen_component event`, async () => {
      const data = generateMock(TrackComponentPropertiesSchema);
      await analytics.dispatch({
        type: HAS_SEEN_COMPONENT,
        ...data,
      });
      await waitFor(() => {
        expect(testAnalyticsPlugin.onTrackComponentMock).toHaveBeenCalledTimes(
          1
        );
        expect(testAnalyticsPlugin.onTrackComponentMock).toHaveBeenCalledWith(
          data
        );
      });
    });
    it('should not receive the has_seen_component event if the payload is wrong', async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await analytics.dispatch({
        type: HAS_SEEN_COMPONENT,
        foo: 'bar',
      });
      await waitFor(() => {
        expect(testAnalyticsPlugin.onTrackComponentMock).toHaveBeenCalledTimes(
          0
        );
      });
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
            selectedVariantIndex: 1,
            selectedVariantSelector: 'variant 1',
          },
          {
            ninetailed_experience_name: 'nt_experience',
          }
        );
      });
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
      await waitFor(() => {
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
            selectedVariantIndex: 1,
            selectedVariantSelector: 'variant 1',
          },
          {
            'experience-1': 'bar',
          }
        );
      });
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
});
