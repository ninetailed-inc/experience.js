import {
  FEATURES,
  NinetailedApiClient,
} from '@ninetailed/experience.js-shared';
import { Ninetailed } from './Ninetailed';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const mockProfile = () => {
  const apiClient = new NinetailedApiClient({ clientId: 'test' });
  apiClient.upsertProfile = jest.fn().mockResolvedValue({
    id: 'test',
    traits: {},
    random: 0.5,
    audiences: [],
    location: {},
    session: {},
  });
  const ninetailed = new Ninetailed(apiClient);

  return { apiClient, ninetailed };
};

const mockProfileError = () => {
  const apiClient = new NinetailedApiClient({ clientId: 'test' });
  apiClient.upsertProfile = jest.fn().mockRejectedValue(new Error('test'));
  const ninetailed = new Ninetailed(apiClient);

  return { apiClient, ninetailed };
};

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
});
