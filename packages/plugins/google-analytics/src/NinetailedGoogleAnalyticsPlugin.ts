import {
  NinetailedAnalyticsPlugin,
  SanitizedElementSeenPayload,
  TrackComponentProperties,
} from '@ninetailed/experience.js-plugin-analytics';
import { template } from '@ninetailed/experience.js-shared';

type NinetailedGoogleAnalyticsPluginOptions = {
  actionTemplate?: string;
  labelTemplate?: string;
};

const TEMPLATE_OPTIONS = {
  interpolate: /{{([\s\S]+?)}}/g,
};

const isGoogleAnalyticsInitialized = () => {
  return (
    typeof window === 'object' &&
    'gtag' in window &&
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    typeof window.gtag === 'function'
  );
};

export class NinetailedGoogleAnalyticsPlugin extends NinetailedAnalyticsPlugin {
  public name = 'ninetailed:google-analytics';

  constructor(private options: NinetailedGoogleAnalyticsPluginOptions = {}) {
    super();
  }

  protected onTrackExperience(
    properties: SanitizedElementSeenPayload
  ): Promise<void> {
    return Promise.resolve();
  }

  protected async onTrackComponent(
    properties: TrackComponentProperties
  ): Promise<void> {
    if (!isGoogleAnalyticsInitialized()) {
      return;
    }

    const { variant, audience, isPersonalized } = properties;
    const action = template(
      this.options.actionTemplate ||
        'Has Seen Component - Audience:{{ audience.id }}',
      { component: variant, audience },
      TEMPLATE_OPTIONS.interpolate
    );

    const label = template(
      this.options.labelTemplate ||
        '{{ baselineOrVariant }}:{{ component.id }}',
      {
        component: variant,
        audience,
        baselineOrVariant: isPersonalized ? 'Variant' : 'Baseline',
      },
      TEMPLATE_OPTIONS.interpolate
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.gtag('event', action, {
      category: 'Ninetailed',
      label,
      nonInteraction: true,
    });
  }
}
