import {
  NinetailedAnalyticsPlugin,
  SanitizedElementSeenPayload,
} from '@ninetailed/experience.js-plugin-analytics';
import { TrackComponentProperties } from '@ninetailed/experience.js';
import { template } from '@ninetailed/experience.js-shared';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ninetailed?: {
      plugins: {
        contentsquare: {
          dataLayer: unknown[];
        };
        [name: string]: unknown;
      };
    } & unknown;
  }
}

type NinetailedContentsquarePluginOptions = {
  actionTemplate?: string;
};

const TEMPLATE_OPTIONS = {
  interpolate: /{{([\s\S]+?)}}/g,
};

export class NinetailedContentsquarePlugin extends NinetailedAnalyticsPlugin {
  public name = 'ninetailed:contentsquare';

  constructor(
    private readonly options: NinetailedContentsquarePluginOptions = {}
  ) {
    super();
  }

  public initialize = () => {
    if (typeof window !== 'undefined') {
      window.ninetailed = Object.assign({}, window.ninetailed, {
        plugins: {
          ...window.ninetailed?.plugins,
          contentsquare: { dataLayer: [] },
        },
      });
    }
  };

  protected async onTrackExperience(
    properties: SanitizedElementSeenPayload
  ): Promise<void> {
    const { experience, audience, selectedVariant, selectedVariantIndex } =
      properties;

    const action = template(
      this.options.actionTemplate || 'nt_experience',
      { variant: selectedVariant, experience },
      TEMPLATE_OPTIONS.interpolate
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    window.ninetailed?.plugins['contentsquare'].dataLayer.push({
      event: action,
      variant:
        selectedVariantIndex === 0
          ? 'control'
          : `variant ${selectedVariantIndex}`,
      experience: experience.id,
      component: selectedVariant.id,
      audience: audience.id,
    });
  }
  protected async onTrackComponent(
    properties: TrackComponentProperties
  ): Promise<void> {
    const { variant, audience } = properties;

    const action = template(
      this.options.actionTemplate ||
        'Has Seen Component - Audience:{{ audience.id }}',
      { component: variant, audience },
      TEMPLATE_OPTIONS.interpolate
    );

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    window.ninetailed?.plugins['contentsquare'].dataLayer.push({
      event: action,
      variant: variant?.id,
      experience: audience?.id,
    });
  }
}
