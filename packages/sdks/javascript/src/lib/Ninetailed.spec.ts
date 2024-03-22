import { setTimeout as sleep } from 'node:timers/promises';
import {
  FEATURES,
  NinetailedApiClient,
} from '@ninetailed/experience.js-shared';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { TestAnalyticsPlugin } from '@ninetailed/experience.js-plugin-analytics/test';

import { Ninetailed } from './Ninetailed';
import {
  getObserverOf,
  intersect,
} from './test-helpers/intersection-observer-test-helper';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockProfile = (plugins: NinetailedPlugin[] = []) => {
  const apiClient = new NinetailedApiClient({ clientId: 'test' });
  apiClient.upsertProfile = jest.fn().mockResolvedValue({
    id: 'test',
    traits: {},
    random: 0.5,
    audiences: [],
    location: {},
    session: {},
  });
  const ninetailed = new Ninetailed(apiClient, { plugins });

  return { apiClient, ninetailed };
};

const mockProfileError = () => {
  const apiClient = new NinetailedApiClient({ clientId: 'test' });
  apiClient.upsertProfile = jest.fn().mockRejectedValue(new Error('test'));
  const ninetailed = new Ninetailed(apiClient);

  return { apiClient, ninetailed };
};

/* TODO: Replace this with a proper mock generator once the circular dependency
 * with the utils javascript package is resolved
 */
const generateExperience = () => ({
  id: 'a12b3c4d5e6f7g8h9i0j',
  name: 'Experiment 1',
  description: 'This is just a test',
  type: 'nt_experiment' as const,
  config: {
    distribution: [0.5, 0.5],
    traffic: 1,
    components: [
      { baseline: { id: '' }, variants: [{ id: '', hidden: false }] },
    ],
    sticky: false,
  },
  audience: {
    id: 'c1d2e3f4g5h6i7j8k9l0',
    name: 'All user',
    description: 'All the users',
  },
  variants: [{ id: 'laudantium' }, { id: 'minus' }, { id: 'dolorum' }],
});

describe('Ninetailed core class', () => {
  let ninetailed: Ninetailed;
  let apiClient: NinetailedApiClient;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Instantiation of the Ninetailed core class', () => {
    it('should be able to create a new instance with ApiClient Options', () => {
      const instance = new Ninetailed({
        clientId: 'test',
      });

      expect(instance).toBeInstanceOf(Ninetailed);
    });

    it('should be able to create a new instance with a outside instantiated NinetailedApiClient', () => {
      const instance = new Ninetailed(
        new NinetailedApiClient({ clientId: 'test' })
      );

      expect(instance).toBeInstanceOf(Ninetailed);
    });
  });

  describe('Sending of events', () => {
    beforeEach(() => {
      ({ apiClient, ninetailed } = mockProfile());
    });

    it('should be able to send a page event', async () => {
      await ninetailed.page();

      expect(apiClient.upsertProfile).toBeCalledTimes(1);
    });

    it('should be able to send a identify event', async () => {
      await ninetailed.identify('test', { foo: 'bar' });

      expect(apiClient.upsertProfile).toBeCalledTimes(1);
    });

    it('should be able to send a track event', async () => {
      await ninetailed.track('test');

      expect(apiClient.upsertProfile).toBeCalledTimes(1);
    });

    it('should not reuse the mergeId when sending a second identify event with an empty id', async () => {
      await ninetailed.identify('test', { foo: 'bar' });
      expect(apiClient.upsertProfile).toBeCalledWith(
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              userId: 'test',
            }),
          ]),
        }),
        expect.anything()
      );

      await ninetailed.identify('', { baz: 'qux' });
      expect(apiClient.upsertProfile).toBeCalledWith(
        expect.objectContaining({
          events: expect.arrayContaining([
            expect.objectContaining({
              userId: '',
            }),
          ]),
        }),
        expect.anything()
      );
    });
  });

  describe('Queueing of events', () => {
    describe('awaiting an event should resolve the promise with a success false when the event sending failed', () => {
      beforeEach(() => {
        ({ apiClient, ninetailed } = mockProfileError());
      });

      it('page events', async () => {
        await expect(ninetailed.page()).resolves.toEqual({ success: false });
      });

      it('track events', async () => {
        await expect(ninetailed.track('test')).resolves.toEqual({
          success: false,
        });
      });

      it('identify events', async () => {
        await expect(
          ninetailed.identify('test', { foo: 'bar' })
        ).resolves.toEqual({
          success: false,
        });
      });
    });

    it('should await the queue time before sending further events', async () => {
      const { apiClient, ninetailed } = mockProfile();

      // the first event is sent immediately
      await ninetailed.identify('', { foo: 'bar' });
      expect(apiClient.upsertProfile).toBeCalledTimes(1);

      // the second event is sent after the first event was sent, because of the await
      ninetailed.identify('', { foo: 'bar' });
      ninetailed.identify('', { foo: 'bar' });
      await wait(30);
      expect(apiClient.upsertProfile).toBeCalledTimes(2);
    });

    it('should set all Features as enabled by default', async () => {
      const { apiClient, ninetailed } = mockProfile();

      await ninetailed.identify('', { foo: 'bar' });
      expect(apiClient.upsertProfile).toBeCalledWith(
        expect.anything(),
        expect.objectContaining({
          enabledFeatures: [FEATURES.IP_ENRICHMENT, FEATURES.LOCATION],
        })
      );
    });

    describe('awaiting a event should resolve the promise when the event was successfully sent', () => {
      beforeEach(() => {
        ({ apiClient, ninetailed } = mockProfile());
      });

      it('page events', async () => {
        await ninetailed.page();
        await ninetailed.page();

        expect(apiClient.upsertProfile).toBeCalledTimes(2);
      });

      it('track events', async () => {
        await ninetailed.track('test');
        await ninetailed.track('test');

        expect(apiClient.upsertProfile).toBeCalledTimes(2);
      });

      it('identify events', async () => {
        await ninetailed.identify('', { foo: 'bar' });
        await ninetailed.identify('', { foo: 'bar' });

        expect(apiClient.upsertProfile).toBeCalledTimes(2);

        (apiClient.upsertProfile as jest.Mock).mockReset();

        // the first time is sent immediately
        await ninetailed.identify('', { foo: 'bar' });
        // if we won't await the second event, it will be put into the 2nd batch
        ninetailed.identify('', { foo: 'bar' });
        // await the second batch
        await ninetailed.identify('', { foo: 'bar' });

        expect(apiClient.upsertProfile).toBeCalledTimes(2);

        (apiClient.upsertProfile as jest.Mock).mockReset();

        await ninetailed.identify('', { foo: 'bar' });
        await ninetailed.identify('', { foo: 'bar' });
        await ninetailed.identify('', { foo: 'bar' });

        expect(apiClient.upsertProfile).toBeCalledTimes(3);
      });
    });
  });

  describe('Observing elements and triggering component views', () => {
    beforeEach(() => {
      // We use fake timers bcause our ElementSeenObserver relies on setTimeout
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('should track a component view for an intersecting element', async () => {
      const element = document.body.appendChild(document.createElement('div'));
      const testPlugin = new TestAnalyticsPlugin({}, jest.fn(), jest.fn());
      const { ninetailed } = mockProfile([testPlugin]);

      // Triggers the mocking of the IntersectionObserver
      getObserverOf(element);

      const experience = generateExperience();

      ninetailed.observeElement({
        element,
        variant: { id: 'variant-id' },
        variantIndex: 1,
        experience,
      });

      // Simulate the intersection of the element with the viewport
      intersect(element, true);

      // Advance the timers to trigger the callback inside ElementSeenObserver
      jest.runAllTimers();

      await sleep(5);

      expect(testPlugin.onTrackExperienceMock).toBeCalledTimes(1);
      expect(testPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVariantIndex: 1,
          selectedVariant: { id: 'variant-id' },
        }),
        expect.any(Object)
      );
    });

    it('should track a component view for multiple intersecting elements', async () => {
      const element1 = document.body.appendChild(document.createElement('div'));
      const element2 = document.body.appendChild(document.createElement('div'));
      const testPlugin = new TestAnalyticsPlugin({}, jest.fn(), jest.fn());
      const { ninetailed } = mockProfile([testPlugin]);

      getObserverOf(element1);
      getObserverOf(element2);

      const experience = generateExperience();

      ninetailed.observeElement({
        element: element1,
        variant: { id: 'variant-1-id' },
        variantIndex: 1,
        experience,
      });

      ninetailed.observeElement({
        element: element2,
        variant: { id: 'variant-2-id' },
        variantIndex: 2,
        experience,
      });

      intersect(element1, true);
      intersect(element2, true);

      jest.runAllTimers();

      await sleep(5);

      expect(testPlugin.onTrackExperienceMock).toBeCalledTimes(2);

      expect(testPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVariantIndex: 1,
          selectedVariant: { id: 'variant-1-id' },
        }),
        expect.any(Object)
      );

      expect(testPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVariantIndex: 2,
          selectedVariant: { id: 'variant-2-id' },
        }),
        expect.any(Object)
      );
    });

    it('should track component views for an intersecting element with different payloads', async () => {
      const element = document.body.appendChild(document.createElement('div'));
      const testPlugin = new TestAnalyticsPlugin({}, jest.fn(), jest.fn());
      const { ninetailed } = mockProfile([testPlugin]);

      getObserverOf(element);

      const experience = generateExperience();

      ninetailed.observeElement({
        element,
        variant: { id: 'variant-1-id' },
        variantIndex: 1,
        experience,
      });

      ninetailed.observeElement({
        element,
        variant: { id: 'variant-2-id' },
        variantIndex: 2,
        experience,
      });

      intersect(element, true);

      jest.runAllTimers();

      await sleep(5);

      expect(testPlugin.onTrackExperienceMock).toBeCalledTimes(2);

      expect(testPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVariantIndex: 1,
          selectedVariant: { id: 'variant-1-id' },
        }),
        expect.any(Object)
      );

      expect(testPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVariantIndex: 2,
          selectedVariant: { id: 'variant-2-id' },
        }),
        expect.any(Object)
      );
    });

    it('should track a single component view for an intersecting element with multiple but equal payloads', async () => {
      const element = document.body.appendChild(document.createElement('div'));
      const testPlugin = new TestAnalyticsPlugin({}, jest.fn(), jest.fn());
      const { ninetailed } = mockProfile([testPlugin]);

      getObserverOf(element);

      const experience = generateExperience();

      ninetailed.observeElement({
        element,
        variant: { id: 'variant-1-id' },
        variantIndex: 1,
        experience,
      });

      ninetailed.observeElement({
        element,
        variant: { id: 'variant-1-id' },
        variantIndex: 1,
        experience,
      });

      intersect(element, true);

      jest.runAllTimers();

      await sleep(5);

      expect(testPlugin.onTrackExperienceMock).toBeCalledTimes(1);

      expect(testPlugin.onTrackExperienceMock).toHaveBeenCalledWith(
        expect.objectContaining({
          selectedVariantIndex: 1,
          selectedVariant: { id: 'variant-1-id' },
        }),
        expect.any(Object)
      );
    });

    it('should not track a component view when no experience is provided', async () => {
      const element = document.body.appendChild(document.createElement('div'));
      const testPlugin = new TestAnalyticsPlugin({}, jest.fn(), jest.fn());
      const { ninetailed } = mockProfile([testPlugin]);

      getObserverOf(element);

      ninetailed.observeElement({
        element,
        variant: { id: 'variant-id' },
        variantIndex: 1,
      });

      intersect(element, true);

      jest.runAllTimers();

      await sleep(5);

      expect(testPlugin.onTrackExperienceMock).not.toBeCalled();
    });

    it('should not track a component view for elements that are not instances of Element', async () => {
      const element = 'element';
      const testPlugin = new TestAnalyticsPlugin({}, jest.fn(), jest.fn());
      const { ninetailed } = mockProfile([testPlugin]);

      getObserverOf(element as any);

      const experience = generateExperience();

      ninetailed.observeElement({
        element: element as any,
        variant: { id: 'variant-id' },
        variantIndex: 1,
        experience,
      });

      intersect(element as any, true);

      jest.runAllTimers();

      await sleep(5);

      expect(testPlugin.onTrackExperienceMock).not.toBeCalled();
    });
  });
});
