import { setTimeout as sleep } from 'node:timers/promises';
import { NinetailedApiClient } from '@ninetailed/experience.js-shared';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { Ninetailed } from '@ninetailed/experience.js';

import { NinetailedInsightsPlugin } from './NinetailedInsightsPlugin';
import { intersect } from './test-helpers/intersection-observer-test-helper';

const insightsApiClientSendEventBatchesMock = jest.fn().mockResolvedValue({});

jest.mock('./api/NinetailedInsightsApiClient', () => {
  return {
    NinetailedInsightsApiClient: class NinetailedInsightsApiClient {
      sendEventBatches = insightsApiClientSendEventBatchesMock;
    },
  };
});

// TODO we need to refactor the tests to not rely on the insightsApiClientSendEventBatchesMock as the only way to verify if events were sent or not.
// Because of the batching and queueing logic it is possible that multiple calls to observeElement result in no events being sent if they are considered duplicates or the queue is not full enough to be flushed.
describe('NinetailedInsightsPlugin', () => {
  beforeEach(() => {
    insightsApiClientSendEventBatchesMock.mockClear();
  });

  const setupNinetailedInstance = (plugins: NinetailedPlugin[] = []) => {
    const apiClient = new NinetailedApiClient({ clientId: 'test' });
    apiClient.upsertProfile = jest.fn().mockResolvedValue({
      id: 'test',
      traits: {},
      random: 0.5,
      audiences: [],
      location: {},
      session: {},
      profile: {
        id: 'p-a12b3c4d5e6f7g8h9i0j',
      },
    });

    return new Ninetailed(apiClient, { plugins });
  };

  it('should send component events once the queue can be flushed', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const ninetailed = setupNinetailedInstance([insightsPlugin]);

    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    for (let i = 0; i < 25; i++) {
      const element = document.body.appendChild(document.createElement('div'));

      ninetailed.observeElement({
        element,
        variant: { id: `variant-id-${i + 1}` },
        variantIndex: i,
      });

      intersect(element, true);
    }

    jest.runAllTimers();
    jest.useRealTimers();

    await sleep(5);

    expect(insightsApiClientSendEventBatchesMock).toHaveBeenCalledTimes(1);
    expect(
      insightsApiClientSendEventBatchesMock.mock.calls[0][0][0].events.length
    ).toBe(25);
    expect(
      insightsApiClientSendEventBatchesMock.mock.calls[0][0][0].events
    ).toEqual(
      expect.arrayContaining(
        Array.from({ length: 25 }).map((_, i) =>
          expect.objectContaining({
            type: 'component',
            componentId: expect.any(String),
            variantIndex: i,
          })
        )
      )
    );
  });

  it('should not send component events when the queue is not ready to be flushed', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const ninetailed = setupNinetailedInstance([insightsPlugin]);
    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    for (let i = 0; i < 5; i++) {
      const element = document.body.appendChild(document.createElement('div'));

      ninetailed.observeElement({
        element,
        variant: { id: `variant-id-${i + 1}` },
        variantIndex: i,
      });

      intersect(element, true);
    }

    jest.runAllTimers();
    jest.useRealTimers();

    await sleep(5);

    expect(insightsApiClientSendEventBatchesMock).not.toBeCalled();
  });

  // This is a rare case and would only happen if a profile changes while the user is on the same page and the component would change e.g. from baseline to variant 1
  it('should track the same element with different payloads', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const ninetailed = setupNinetailedInstance([insightsPlugin]);

    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    const element = document.body.appendChild(document.createElement('div'));

    // TODO improve test to actually unobserve -> intersect -> observe again
    // The queue needs to be flushed before unobserving. When unobserving before flushing, the event is lost.
    // Generally, on a profile change triggers a flush of the queue afterwards the element will be unobserved as the element changes.
    for (let i = 0; i < 25; i++) {
      ninetailed.observeElement({
        element,
        variant: { id: `variant-id-${i + 1}` },
        variantIndex: i,
      });
    }
    intersect(element, true);

    jest.runAllTimers();
    jest.useRealTimers();

    await sleep(5);

    expect(insightsApiClientSendEventBatchesMock).toBeCalledTimes(1);
  });

  it('should not track the same element with the same payload', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const ninetailed = setupNinetailedInstance([insightsPlugin]);

    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    const element = document.body.appendChild(document.createElement('div'));

    for (let i = 0; i < 25; i++) {
      ninetailed.observeElement({
        element,
        variant: { id: `variant-id-1` },
        variantIndex: 0,
      });
    }

    intersect(element, true);

    jest.runAllTimers();
    jest.useRealTimers();

    await sleep(5);

    expect(insightsApiClientSendEventBatchesMock).toBeCalledTimes(0);
  });

  // TODO We need to refactor the test as the insightsApiClientSendEventBatchesMock cannot be relied on here to check if the same element with same payload was sent multiple times or not
  it('should not track the same element with the same payload on multiple views', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const ninetailed = setupNinetailedInstance([insightsPlugin]);

    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    const element = document.body.appendChild(document.createElement('div'));

    for (let i = 0; i < 25; i++) {
      ninetailed.observeElement({
        element,
        variant: { id: `variant-id-1` },
        variantIndex: 0,
      });
    }

    // Intersect twice to simulate multiple views
    intersect(element, true);
    intersect(element, true);

    jest.runAllTimers();
    jest.useRealTimers();

    await sleep(5);

    // Should not flush because only one unique event
    expect(insightsApiClientSendEventBatchesMock).toBeCalledTimes(0);
  });
});
