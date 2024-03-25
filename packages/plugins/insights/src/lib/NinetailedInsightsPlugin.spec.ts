import { setTimeout as sleep } from 'node:timers/promises';
import { NinetailedApiClient } from '@ninetailed/experience.js-shared';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { Ninetailed } from '@ninetailed/experience.js';

import { NinetailedInsightsPlugin } from './NinetailedInsightsPlugin';
import {
  getObserverOf,
  intersect,
} from './test-helpers/intersection-observer-test-helper';

const insightsApiClientSendEventBatchesMock = jest.fn().mockResolvedValue({});

jest.mock('./api/NinetailedInsightsApiClient', () => {
  return {
    NinetailedInsightsApiClient: class NinetailedInsightsApiClient {
      sendEventBatches = insightsApiClientSendEventBatchesMock;
    },
  };
});

describe('NinetailedInsightsPlugin', () => {
  beforeEach(() => {
    insightsApiClientSendEventBatchesMock.mockClear();
  });

  const mockProfile = (plugins: NinetailedPlugin[] = []) => {
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
    const ninetailed = new Ninetailed(apiClient, { plugins });

    return { apiClient, ninetailed };
  };

  it('should send component events once the queue can be flushed', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const { ninetailed } = mockProfile([insightsPlugin]);

    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    for (let i = 0; i < 25; i++) {
      const element = document.body.appendChild(document.createElement('div'));

      getObserverOf(element);

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

    expect(insightsApiClientSendEventBatchesMock).toHaveBeenCalledTimes(2);
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
    const { ninetailed } = mockProfile([insightsPlugin]);

    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    for (let i = 0; i < 5; i++) {
      const element = document.body.appendChild(document.createElement('div'));

      getObserverOf(element);

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

  it('should track the same element with different payloads', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const { ninetailed } = mockProfile([insightsPlugin]);

    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    const element = document.body.appendChild(document.createElement('div'));
    getObserverOf(element);

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

    // Will be called twice because of the two unique delays on the Ninetailed class
    expect(insightsApiClientSendEventBatchesMock).toBeCalledTimes(2);
  });

  it('should not track the same element with the same payload', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const { ninetailed } = mockProfile([insightsPlugin]);

    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });

    await ninetailed.identify('test');

    jest.useFakeTimers();

    const element = document.body.appendChild(document.createElement('div'));
    getObserverOf(element);

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
});
