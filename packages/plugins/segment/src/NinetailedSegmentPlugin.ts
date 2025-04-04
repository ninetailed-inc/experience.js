import {
  NinetailedAnalyticsPlugin,
  SanitizedElementSeenPayload,
  Template,
  TrackComponentProperties,
} from '@ninetailed/experience.js-plugin-analytics';
import { template, logger } from '@ninetailed/experience.js-shared';

type AnalyticsBrowserLike = {
  track: (
    eventName: string,
    properties: Record<string, unknown>
  ) => Promise<unknown>;
};

type NinetailedSegmentPluginOptions = {
  eventNameTemplate?: string;
  categoryPropertyTemplate?: string;
  componentPropertyTemplate?: string;
  audiencePropertyTemplate?: string;

  template?: Template;

  /**
   * An optional Segment analytics instance to use.
   * Consider passing this if you are initializing Segment in your application in a way that doesn't attach
   * the analytics instance to the window object.
   */
  analytics?: AnalyticsBrowserLike;
};

const TEMPLATE_OPTIONS = {
  interpolate: /{{([\s\S]+?)}}/g,
};

export class NinetailedSegmentPlugin extends NinetailedAnalyticsPlugin {
  public name = 'ninetailed:segment';

  constructor(private options: NinetailedSegmentPluginOptions = {}) {
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

  private get segmentInstance() {
    if (this.options.analytics) {
      return this.options.analytics;
    }

    if (
      typeof window === 'object' &&
      'analytics' in window &&
      typeof window.analytics === 'object' &&
      window.analytics !== null &&
      'track' in window.analytics &&
      typeof window.analytics.track === 'function'
    ) {
      return window.analytics as AnalyticsBrowserLike;
    }

    logger.warn(
      'Ninetailed Segment Plugin: No analytics instance found. Make sure the Segment analytics instance is initialized and attached to the window. Alternatively, you can pass the analytics instance to the plugin options.'
    );

    return null;
  }

  protected async onTrackExperience(
    properties: SanitizedElementSeenPayload,
    hasSeenExperienceEventPayload: Record<string, string>
  ): Promise<void> {
    const analytics = this.segmentInstance;

    if (!analytics) {
      return;
    }

    const { event, ...trackEventProperties } = hasSeenExperienceEventPayload;

    analytics.track(event, trackEventProperties);
  }

  protected async onTrackComponent(
    properties: TrackComponentProperties
  ): Promise<void> {
    const analytics = this.segmentInstance;

    if (!analytics) {
      return;
    }

    const { variant, audience, isPersonalized } = properties;
    const event = template(
      this.options.eventNameTemplate ||
        'Has Seen Component - Audience:{{ audience.id }}',
      { variant, audience, isPersonalized },
      TEMPLATE_OPTIONS.interpolate
    );
    const categoryProperty = template(
      this.options.categoryPropertyTemplate || 'Ninetailed',
      {
        variant,
        component: variant,
        audience,
        isPersonalized,
      },
      TEMPLATE_OPTIONS.interpolate
    );
    const componentProperty = template(
      this.options.componentPropertyTemplate || '{{ component.id }}',
      {
        variant,
        component: variant,
        audience,
        isPersonalized,
      },
      TEMPLATE_OPTIONS.interpolate
    );
    const audienceProperty = template(
      this.options.audiencePropertyTemplate || '{{ audience.id }}',
      {
        variant,
        component: variant,
        audience,
        isPersonalized,
      },
      TEMPLATE_OPTIONS.interpolate
    );

    analytics.track(event, {
      category: categoryProperty,
      component: componentProperty,
      audience: audienceProperty,
      isPersonalized,
    });
  }
}
