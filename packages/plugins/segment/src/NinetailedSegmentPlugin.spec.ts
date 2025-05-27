import { Ninetailed } from '@ninetailed/experience.js';
import { setTimeout as sleep } from 'node:timers/promises';
import { AnalyticsBrowser } from '@segment/analytics-next';

import { NinetailedSegmentPlugin } from './NinetailedSegmentPlugin';
import { ComponentViewEventComponentType } from '@ninetailed/experience.js-plugin-analytics';

type SetupArgs = {
  attachAnalyticsToWindow: boolean;
  provideAnalyticsOption: boolean;
};

const setup = ({
  attachAnalyticsToWindow,
  provideAnalyticsOption,
}: SetupArgs) => {
  const segment = new AnalyticsBrowser();
  segment.track = jest.fn();

  if (attachAnalyticsToWindow) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.analytics = segment;
  }

  const segmentPlugin = new NinetailedSegmentPlugin({
    analytics: provideAnalyticsOption ? segment : undefined,
  });

  const ninetailed = new Ninetailed(
    { clientId: 'test' },
    { plugins: [segmentPlugin] }
  );

  return { ninetailed, segment };
};

describe('NinetailedSegmentPlugin', () => {
  it('should be defined', () => {
    expect(NinetailedSegmentPlugin).toBeDefined();
  });

  it('should be instantiable', () => {
    const plugin = new NinetailedSegmentPlugin();

    expect(plugin).toBeInstanceOf(NinetailedSegmentPlugin);
  });

  describe('with analytics attached to window', () => {
    let ninetailed: Ninetailed;
    let segment: AnalyticsBrowser;

    beforeEach(() => {
      ({ ninetailed, segment } = setup({
        attachAnalyticsToWindow: true,
        provideAnalyticsOption: false,
      }));
    });

    afterEach(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete window.analytics;
    });

    it('should send has seen experience events to segment', async () => {
      await ninetailed.trackComponentView({
        element: {} as Element,
        variantIndex: 0,
        variant: {
          id: 'test-component',
        },
        componentType: ComponentViewEventComponentType.Entry,
        experience: {
          id: 'test-experience',
          type: 'nt_experiment',
          name: 'test-experience-name',
        },
        audience: {
          id: 'test-audience',
        },
      });

      await sleep(5);

      expect(segment.track).toBeCalledTimes(1);
      expect(segment.track).toBeCalledWith('nt_experience', {
        ninetailed_audience: 'test-audience',
        ninetailed_component: 'test-component',
        ninetailed_experience: 'test-experience',
        ninetailed_experience_name: 'test-experience-name',
        ninetailed_variant: 'control',
      });
    });

    it('should send has seen component events to segment', async () => {
      await ninetailed.trackHasSeenComponent({
        variant: {
          id: 'test',
        },
        audience: {
          id: 'test',
        },
        isPersonalized: true,
      });

      await sleep(5);
      expect(segment.track).toBeCalledTimes(1);
      expect(segment.track).toBeCalledWith(
        'Has Seen Component - Audience:test',
        {
          audience: 'test',
          category: 'Ninetailed',
          component: 'test',
          isPersonalized: true,
        }
      );
    });
  });

  describe('with analytics provided as an option', () => {
    let ninetailed: Ninetailed;
    let segment: AnalyticsBrowser;

    beforeEach(() => {
      ({ ninetailed, segment } = setup({
        attachAnalyticsToWindow: false,
        provideAnalyticsOption: true,
      }));
    });

    it('should send has seen experience events to segment', async () => {
      await ninetailed.trackComponentView({
        element: {} as Element,
        variantIndex: 0,
        componentType: ComponentViewEventComponentType.Entry,
        variant: {
          id: 'test-component',
        },
        experience: {
          id: 'test-experience',
          type: 'nt_experiment',
          name: 'test-experience-name',
        },
        audience: {
          id: 'test-audience',
        },
      });

      await sleep(5);

      expect(segment.track).toBeCalledTimes(1);
      expect(segment.track).toBeCalledWith('nt_experience', {
        ninetailed_audience: 'test-audience',
        ninetailed_component: 'test-component',
        ninetailed_experience: 'test-experience',
        ninetailed_experience_name: 'test-experience-name',
        ninetailed_variant: 'control',
      });
    });

    it('should send has seen component events to segment', async () => {
      await ninetailed.trackHasSeenComponent({
        variant: {
          id: 'test',
        },
        audience: {
          id: 'test',
        },
        isPersonalized: true,
      });

      await sleep(5);
      expect(segment.track).toBeCalledTimes(1);
      expect(segment.track).toBeCalledWith(
        'Has Seen Component - Audience:test',
        {
          audience: 'test',
          category: 'Ninetailed',
          component: 'test',
          isPersonalized: true,
        }
      );
    });
  });

  describe('with neither analytics attached to window nor provided as an option', () => {
    let ninetailed: Ninetailed;
    let segment: AnalyticsBrowser;

    beforeEach(() => {
      ({ ninetailed, segment } = setup({
        attachAnalyticsToWindow: false,
        provideAnalyticsOption: false,
      }));
    });

    it('should not send has seen experience events to segment', async () => {
      await ninetailed.trackComponentView({
        element: {} as Element,
        variantIndex: 0,
        componentType: ComponentViewEventComponentType.Entry,
        variant: {
          id: 'test-component',
        },
        experience: {
          id: 'test-experience',
          type: 'nt_experiment',
          name: 'test-experience-name',
        },
        audience: {
          id: 'test-audience',
        },
      });

      await sleep(5);

      expect(segment.track).not.toBeCalled();
    });

    it('should not send has seen component events to segment', async () => {
      await ninetailed.trackHasSeenComponent({
        variant: {
          id: 'test',
        },
        audience: {
          id: 'test',
        },
        isPersonalized: true,
      });

      await sleep(5);

      expect(segment.track).not.toBeCalled();
    });
  });
});
