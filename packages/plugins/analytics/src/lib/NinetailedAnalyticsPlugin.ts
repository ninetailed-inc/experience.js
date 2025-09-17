import { isEqual } from 'radash';
import { logger, template } from '@ninetailed/experience.js-shared';

import {
  type ElementSeenPayload,
  ElementSeenPayloadSchema,
  type VariableSeenPayload,
  VariableSeenPayloadSchema,
} from './ElementSeenPayload';
import {
  type TrackComponentProperties,
  TrackComponentPropertiesSchema,
} from './TrackingProperties';
import { EventHandler, NinetailedPlugin } from './NinetailedPlugin';
import { HAS_SEEN_COMPONENT } from './constants';

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

export type SanitizedVariableSeenPayload = {
  componentId: string;
  selectedVariant: VariableSeenPayload['variant'];
  selectedVariantIndex: VariableSeenPayload['variantIndex'];
  selectedVariantSelector: string;
};

export abstract class NinetailedAnalyticsPlugin<
  THasSeenExperienceEventTemplate extends Template = Template
> extends NinetailedPlugin {
  private seenElements = new WeakMap<Element, SanitizedElementSeenPayload[]>();

  private seenVariables = new Map<string, SanitizedVariableSeenPayload[]>();

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

  public override onHasSeenElement: EventHandler<ElementSeenPayload> = ({
    payload,
  }) => {
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

    const elementPayloads = this.seenElements.get(payload.element) || [];

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

    const isElementAlreadySeenWithPayload = elementPayloads.some(
      (elementPayload) => {
        return isEqual(elementPayload, sanitizedTrackExperienceProperties);
      }
    );

    if (isElementAlreadySeenWithPayload) {
      return;
    }

    const insightsPayload = {
      ...sanitizedTrackExperienceProperties,
      componentType: 'Entry',
    };

    this.seenElements.set(payload.element, [
      ...elementPayloads,
      insightsPayload,
    ]);

    this.onTrackExperience(
      insightsPayload,
      this.getHasSeenExperienceEventPayload(insightsPayload)
    );
  };

  public override onHasSeenVariable: EventHandler<VariableSeenPayload> = ({
    payload,
  }) => {
    const sanitizedPayload = VariableSeenPayloadSchema.safeParse(payload);

    if (!sanitizedPayload.success) {
      logger.error(
        'Invalid payload for has_seen_variable event',
        sanitizedPayload.error.format()
      );
      return;
    }

    const componentId = sanitizedPayload.data.variant.id;
    if (typeof componentId === 'undefined') {
      logger.error(
        'Component ID is undefined in has_seen_variable event payload'
      );
      return;
    }

    const variableKey = componentId;
    const variablePayloads = this.seenVariables.get(variableKey) || [];

    const selectedVariantSelector =
      sanitizedPayload.data.variantIndex === 0
        ? 'control'
        : `variant ${sanitizedPayload.data.variantIndex}`;

    const sanitizedTrackVariableProperties: SanitizedVariableSeenPayload = {
      componentId,
      selectedVariant: sanitizedPayload.data.variant,
      selectedVariantIndex: sanitizedPayload.data.variantIndex,
      selectedVariantSelector,
    };
    // Add type only for Insights API payload
    const insightsPayload = {
      ...sanitizedTrackVariableProperties,
      componentType: 'Variable',
    };

    const isVariableAlreadySeenWithPayload = variablePayloads.some(
      (variablePayload) => {
        return isEqual(variablePayload, insightsPayload);
      }
    );

    if (isVariableAlreadySeenWithPayload) {
      return;
    }

    this.seenVariables.set(variableKey, [...variablePayloads, insightsPayload]);
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
