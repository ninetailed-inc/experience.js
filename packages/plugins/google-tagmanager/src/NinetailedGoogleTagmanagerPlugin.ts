import {
  NinetailedAnalyticsPlugin,
  Template,
  SanitizedElementSeenPayload,
} from '@ninetailed/experience.js-plugin-analytics';
import { TrackComponentProperties } from '@ninetailed/experience.js';
import { template } from '@ninetailed/experience.js-shared';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

type NinetailedGoogleTagmanagerPluginOptions = {
  actionTemplate?: string;
  labelTemplate?: string;

  template?: Template;
};

const TEMPLATE_OPTIONS = {
  interpolate: /{{([\s\S]+?)}}/g,
};

export class NinetailedGoogleTagmanagerPlugin extends NinetailedAnalyticsPlugin {
  public name = 'ninetailed:googleTagmanager';

  constructor(
    private readonly options: NinetailedGoogleTagmanagerPluginOptions = {}
  ) {
    super({
      ...options.template,
      event: 'nt_experience',
      ninetailed_variant: '{{selectedVariantSelector}}',
      ninetailed_experience: '{{experience.id}}',
      ninetailed_experience_name: '{{experience.name}}',
      ninetailed_audience: '{{audience.id}}',
      ninetailed_component: '{{selectedVariant.id}}',
    });
  }

  public initialize = () => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
    }
  };

  protected async onTrackExperience(
    properties: SanitizedElementSeenPayload,
    hasSeenExperienceEventPayload: Record<string, string>
  ): Promise<void> {
    window.dataLayer?.push(hasSeenExperienceEventPayload);
  }

  protected async onTrackComponent(
    properties: TrackComponentProperties
  ): Promise<void> {
    const { variant, audience, isPersonalized } = properties;

    const action = template(
      this.options.actionTemplate || 'Has Seen Experience',
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

    window.dataLayer?.push({
      event: action,
      properties: {
        category: 'Ninetailed',
        label,
        nonInteraction: true,
      },
    });
  }
}
