import { logger, template } from '@ninetailed/experience.js-shared';
import { hasComponentViewTrackingThreshold } from './guards/hasComponentViewTrackingThreshold';

import {
  type ElementSeenPayload,
  ElementSeenPayloadSchema,
} from './ElementSeenPayload';
import {
  type TrackComponentProperties,
  TrackComponentPropertiesSchema,
} from './TrackingProperties';
import { EventHandler, NinetailedPlugin } from './NinetailedPlugin';
import { HAS_SEEN_COMPONENT, HAS_SEEN_ELEMENT } from './constants';

export type Template = Record<string, string>;

const TEMPLATE_OPTIONS = {
  interpolate: /{{([\s\S]+?)}}/g,
};

export type SanitizedElementSeenPayload = {
  experience: NonNullable<ElementSeenPayload['experience']>;
  audience: NonNullable<ElementSeenPayload['audience']>;
  selectedVariantSelector: string;
  selectedVariant: ElementSeenPayload['variant'];
  selectedVariantIndex: ElementSeenPayload['variantIndex'];
};

export abstract class NinetailedAnalyticsPlugin<
  THasSeenExperienceEventTemplate extends Template = Template
> extends NinetailedPlugin {
  private seenElements = new WeakSet<Element>();

  constructor(
    private readonly hasSeenExperienceEventTemplate: THasSeenExperienceEventTemplate = {} as THasSeenExperienceEventTemplate
  ) {
    super();
  }

  protected abstract onTrackExperience(
    properties: SanitizedElementSeenPayload,
    eventPayload: Record<string, string>
  ): Promise<void>;

  /**
   * @deprecated
   */
  protected abstract onTrackComponent(
    properties: TrackComponentProperties
  ): Promise<void>;

  private getHasSeenExperienceEventPayload = (
    data: SanitizedElementSeenPayload
  ) => {
    const event = Object.entries(
      this.hasSeenExperienceEventTemplate
    ).reduce<THasSeenExperienceEventTemplate>(
      (acc, [keyTemplate, valueTemplate]) => {
        const key = () => {
          try {
            return template(keyTemplate, data, TEMPLATE_OPTIONS.interpolate);
          } catch (error) {
            logger.error(
              `Your Ninetailed Analytics Plugin's template is invalid. They key template ${keyTemplate} could not find the path in the specified experience.`
            );
            return 'undefined';
          }
        };

        const value = () => {
          try {
            return template(valueTemplate, data, TEMPLATE_OPTIONS.interpolate);
          } catch (error) {
            logger.error(
              `Your Ninetailed Analytics Plugin's template is invalid. They value template ${valueTemplate} could not find the path in the specified experience.`
            );
            return 'undefined';
          }
        };

        return {
          ...acc,
          [key()]: value(),
        };
      },
      {} as THasSeenExperienceEventTemplate
    );

    return event;
  };

  public [HAS_SEEN_ELEMENT]: EventHandler<ElementSeenPayload> = ({
    payload,
  }) => {
    if (
      hasComponentViewTrackingThreshold(this) &&
      this.getComponentViewTrackingThreshold() !== payload.seenFor
    ) {
      return;
    }

    if (this.seenElements.has(payload.element)) {
      return;
    }

    const sanitizedPayload = ElementSeenPayloadSchema.safeParse(payload);

    if (!sanitizedPayload.success) {
      logger.error(
        'Invalid payload for has_seen_element event',
        sanitizedPayload.error.format()
      );
      return;
    }

    if (!sanitizedPayload.data.experience || !sanitizedPayload.data.audience) {
      return;
    }

    this.seenElements.add(sanitizedPayload.data.element);

    const selectedVariantSelector =
      sanitizedPayload.data.variantIndex === 0
        ? 'control'
        : `variant ${sanitizedPayload.data.variantIndex}`;
    const sanitizedTrackExperienceProperties = {
      experience: sanitizedPayload.data.experience,
      audience: sanitizedPayload.data.audience,
      selectedVariant: sanitizedPayload.data.variant,
      selectedVariantIndex: sanitizedPayload.data.variantIndex,
      selectedVariantSelector,
    };

    this.onTrackExperience(
      sanitizedTrackExperienceProperties,
      this.getHasSeenExperienceEventPayload(sanitizedTrackExperienceProperties)
    );
  };

  /**
   * @deprecated
   */
  public [HAS_SEEN_COMPONENT]: EventHandler = ({ payload }) => {
    const sanitizedPayload = TrackComponentPropertiesSchema.safeParse(payload);

    if (!sanitizedPayload.success) {
      logger.error(
        'Invalid payload for has_seen_component event',
        sanitizedPayload.error.format()
      );
      return;
    }

    this.onTrackComponent(sanitizedPayload.data);
  };
}
