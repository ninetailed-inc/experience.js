import { waitFor } from '@testing-library/dom';
import { NinetailedApiClient } from '@ninetailed/experience.js-shared';
import { NinetailedPlugin } from '@ninetailed/experience.js-plugin-analytics';
import { COMPONENT_HOVER, Ninetailed } from '@ninetailed/experience.js';
import { NinetailedPrivacyPlugin } from '@ninetailed/experience.js-plugin-privacy';
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
    await waitFor(() => {
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
    await waitFor(() => {
      expect(insightsApiClientSendEventBatchesMock).not.toHaveBeenCalled();
    });
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
    await waitFor(() => {
      expect(insightsApiClientSendEventBatchesMock).toHaveBeenCalledTimes(1);
    });
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
    await waitFor(() => {
      expect(insightsApiClientSendEventBatchesMock).toHaveBeenCalledTimes(0);
    });
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
    await waitFor(() => {
      // Should not flush because only one unique event
      expect(insightsApiClientSendEventBatchesMock).toHaveBeenCalledTimes(0);
    });
  });
  it('should send component click events once the queue can be flushed', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const ninetailed = setupNinetailedInstance([insightsPlugin]);
    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });
    await ninetailed.identify('test');
    for (let i = 0; i < 25; i++) {
      const element = document.body.appendChild(
        document.createElement('button')
      );
      ninetailed.observeElement(
        {
          element,
          variant: { id: `variant-id-${i + 1}` },
          variantIndex: i,
        },
        { trackClicks: true }
      );
      element.click();
    }
    await waitFor(() => {
      expect(insightsApiClientSendEventBatchesMock).toHaveBeenCalledTimes(1);
    });
    expect(
      insightsApiClientSendEventBatchesMock.mock.calls[0][0][0].events.length
    ).toBe(25);
    expect(
      insightsApiClientSendEventBatchesMock.mock.calls[0][0][0].events
    ).toEqual(
      expect.arrayContaining(
        Array.from({ length: 25 }).map((_, i) =>
          expect.objectContaining({
            type: 'component_click',
            componentId: expect.any(String),
            variantIndex: i,
          })
        )
      )
    );
  });
  it('should send component hover events through the insights batching pipeline', async () => {
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
      ninetailed.observeElement(
        {
          element,
          variant: { id: `variant-id-${i + 1}` },
          variantIndex: i,
        },
        { trackHovers: true }
      );
      element.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(10_000);
      element.dispatchEvent(new MouseEvent('mouseleave'));
    }
    jest.runAllTimers();
    jest.useRealTimers();
    await waitFor(() => {
      expect(insightsApiClientSendEventBatchesMock).toHaveBeenCalledTimes(1);
    });
    const hoverEvents =
      insightsApiClientSendEventBatchesMock.mock.calls[0][0][0].events.filter(
        (event: { type?: string }) => event.type === COMPONENT_HOVER
      );
    expect(hoverEvents).toHaveLength(25);
    expect(hoverEvents).toEqual(
      expect.arrayContaining(
        Array.from({ length: 25 }).map((_, i) =>
          expect.objectContaining({
            type: COMPONENT_HOVER,
            componentId: expect.any(String),
            variantIndex: i,
            hoverDurationMs: expect.any(Number),
            componentHoverId: expect.any(String),
          })
        )
      )
    );
  });
  it('should generate a unique componentHoverId for each hover interaction', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const ninetailed = setupNinetailedInstance([insightsPlugin]);
    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });
    await ninetailed.identify('test');
    jest.useFakeTimers();
    const element = document.body.appendChild(document.createElement('div'));
    ninetailed.observeElement(
      {
        element,
        variant: { id: 'variant-id-1' },
        variantIndex: 0,
      },
      { trackHovers: true }
    );
    element.dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(10_000);
    element.dispatchEvent(new MouseEvent('mouseleave'));
    element.dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(10_000);
    element.dispatchEvent(new MouseEvent('mouseleave'));
    jest.runAllTimers();
    jest.useRealTimers();
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(insightsPlugin.events).toHaveLength(2);
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [firstHoverEvent, secondHoverEvent] = insightsPlugin.events as [
      Record<string, unknown>,
      Record<string, unknown>
    ];
    expect(firstHoverEvent['type']).toBe(COMPONENT_HOVER);
    expect(secondHoverEvent['type']).toBe(COMPONENT_HOVER);
    expect(firstHoverEvent['componentHoverId']).toEqual(expect.any(String));
    expect(secondHoverEvent['componentHoverId']).toEqual(expect.any(String));
    expect(firstHoverEvent['componentHoverId']).not.toBe(
      secondHoverEvent['componentHoverId']
    );
  });
  it('should map component hover events to the correct component metadata when multiple elements are observed', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const ninetailed = setupNinetailedInstance([insightsPlugin]);
    insightsPlugin.setCredentials({
      clientId: 'test',
      environment: 'development',
    });
    await ninetailed.identify('test');
    jest.useFakeTimers();
    const elementOne = document.body.appendChild(document.createElement('div'));
    const elementTwo = document.body.appendChild(document.createElement('div'));
    ninetailed.observeElement(
      {
        element: elementOne,
        variant: { id: 'variant-id-1' },
        variantIndex: 1,
      },
      { trackHovers: true }
    );
    ninetailed.observeElement(
      {
        element: elementTwo,
        variant: { id: 'variant-id-2' },
        variantIndex: 2,
      },
      { trackHovers: true }
    );
    elementOne.dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(10_000);
    elementOne.dispatchEvent(new MouseEvent('mouseleave'));
    elementTwo.dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(10_000);
    elementTwo.dispatchEvent(new MouseEvent('mouseleave'));
    jest.runAllTimers();
    jest.useRealTimers();
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(insightsPlugin.events).toHaveLength(2);
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(insightsPlugin.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: COMPONENT_HOVER,
          componentId: expect.any(String),
          variantIndex: 1,
          hoverDurationMs: expect.any(Number),
          componentHoverId: expect.any(String),
        }),
        expect.objectContaining({
          type: COMPONENT_HOVER,
          componentId: expect.any(String),
          variantIndex: 2,
          hoverDurationMs: expect.any(Number),
          componentHoverId: expect.any(String),
        }),
      ])
    );
  });
  it('should not track component clicks when privacy consent is not given', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const privacyPlugin = new NinetailedPrivacyPlugin();
    const ninetailed = setupNinetailedInstance([privacyPlugin, insightsPlugin]);
    const element = document.body.appendChild(document.createElement('button'));
    ninetailed.observeElement(
      {
        element,
        variant: { id: 'variant-id-1' },
        variantIndex: 0,
      },
      { trackClicks: true }
    );
    element.click();
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(insightsPlugin.events).toHaveLength(0);
    });
  });
  it('should track component clicks when privacy consent is given', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const privacyPlugin = new NinetailedPrivacyPlugin();
    const ninetailed = setupNinetailedInstance([privacyPlugin, insightsPlugin]);
    await ninetailed.page();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await privacyPlugin.consent(true);
    const element = document.body.appendChild(document.createElement('button'));
    ninetailed.observeElement(
      {
        element,
        variant: { id: 'variant-id-1' },
        variantIndex: 0,
      },
      { trackClicks: true }
    );
    element.click();
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(insightsPlugin.events).toHaveLength(1);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(insightsPlugin.events[0].type).toBe('component_click');
    });
  });
  it('should track component clicks and hovers independently when both tracking options are enabled', async () => {
    const insightsPlugin = new NinetailedInsightsPlugin();
    const privacyPlugin = new NinetailedPrivacyPlugin();
    const ninetailed = setupNinetailedInstance([privacyPlugin, insightsPlugin]);
    await ninetailed.page();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await privacyPlugin.consent(true);
    jest.useFakeTimers();
    const element = document.body.appendChild(document.createElement('button'));
    ninetailed.observeElement(
      {
        element,
        variant: { id: 'variant-id-1' },
        variantIndex: 0,
      },
      { trackClicks: true, trackHovers: true }
    );
    element.click();
    element.dispatchEvent(new MouseEvent('mouseenter'));
    jest.advanceTimersByTime(10_000);
    element.dispatchEvent(new MouseEvent('mouseleave'));
    jest.runAllTimers();
    jest.useRealTimers();
    await waitFor(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      expect(insightsPlugin.events).toHaveLength(2);
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(insightsPlugin.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'component_click' }),
        expect.objectContaining({
          type: COMPONENT_HOVER,
          hoverDurationMs: expect.any(Number),
          componentHoverId: expect.any(String),
        }),
      ])
    );
  });
});
