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
  componentType: NonNullable<ElementSeenPayload['componentType']>;
};

export type SanitizedVariableSeenPayload = {
  componentId: string;
  componentType: VariableSeenPayload['componentType'];
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
      componentType: sanitizedPayload.data.componentType,
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

    this.seenElements.set(payload.element, [
      ...elementPayloads,
      sanitizedTrackExperienceProperties,
    ]);

    this.onTrackExperience(
      sanitizedTrackExperienceProperties,
      this.getHasSeenExperienceEventPayload(sanitizedTrackExperienceProperties)
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
      componentType: sanitizedPayload.data.componentType,
      selectedVariant: sanitizedPayload.data.variant,
      selectedVariantIndex: sanitizedPayload.data.variantIndex,
      selectedVariantSelector,
    };

    const isVariableAlreadySeenWithPayload = variablePayloads.some(
      (variablePayload) => {
        return isEqual(variablePayload, sanitizedTrackVariableProperties);
      }
    );

    if (isVariableAlreadySeenWithPayload) {
      return;
    }

    this.seenVariables.set(variableKey, [
      ...variablePayloads,
      sanitizedTrackVariableProperties,
    ]);
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
