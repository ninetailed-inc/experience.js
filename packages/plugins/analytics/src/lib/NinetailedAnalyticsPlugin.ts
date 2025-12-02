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

/**
 * This type is only used for the `onTrackExperience` method that is implemented in subclasses of `NinetailedAnalyticsPlugin`.
 */
export type SanitizedElementSeenPayload = {
  experience: NonNullable<ElementSeenPayload['experience']>;
  audience: NonNullable<ElementSeenPayload['audience']>;
  selectedVariantSelector: string;
  selectedVariant: ElementSeenPayload['variant'];
  selectedVariantIndex: ElementSeenPayload['variantIndex'];
  componentType: NonNullable<ElementSeenPayload['componentType']>;
};

// This type is only used in this class right now
export type SanitizedVariableSeenPayload = {
  componentId: string;
  selectedVariant: VariableSeenPayload['variant'];
  selectedVariantIndex: VariableSeenPayload['variantIndex'];
  selectedVariantSelector: string;
  componentType: NonNullable<VariableSeenPayload['componentType']>;
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
    // Safe parsing the payload not only ensures type safety,
    // but also strips out any additional fields that the analytics library attaches to an event's payload. (i.e. meta, _)
    // See the `Payload` type in plugins/analytics/src/lib/NinetailedPlugin.ts for more details.
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

    const sanitizedTrackExperienceProperties: SanitizedElementSeenPayload = {
      experience: sanitizedPayload.data.experience,
      audience: sanitizedPayload.data.audience,
      selectedVariant: sanitizedPayload.data.variant,
      selectedVariantIndex: sanitizedPayload.data.variantIndex,
      selectedVariantSelector,
      componentType: sanitizedPayload.data.componentType,
    };

    const isElementAlreadySeenWithPayload = elementPayloads.some(
      (elementPayload) => {
        return isEqual<SanitizedElementSeenPayload>(
          elementPayload,
          sanitizedTrackExperienceProperties
        );
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

    const variableKey = sanitizedPayload.data.variant.id;

    if (typeof variableKey === 'undefined') {
      logger.error(
        'Variable key is undefined in has_seen_variable event payload'
      );
      return;
    }

    const variablePayloads = this.seenVariables.get(variableKey) || [];

    const selectedVariantSelector =
      sanitizedPayload.data.variantIndex === 0
        ? 'control'
        : `variant ${sanitizedPayload.data.variantIndex}`;

    const sanitizedTrackVariableProperties: SanitizedVariableSeenPayload = {
      componentId: variableKey,
      selectedVariant: sanitizedPayload.data.variant,
      selectedVariantIndex: sanitizedPayload.data.variantIndex,
      selectedVariantSelector,
      componentType: sanitizedPayload.data.componentType,
    };

    const isVariableAlreadySeenWithPayload = variablePayloads.some(
      (variablePayload) => {
        return isEqual<SanitizedVariableSeenPayload>(
          variablePayload,
          sanitizedTrackVariableProperties
        );
      }
    );

    // Should we track it once or multiple times if it is the same payload?
    if (isVariableAlreadySeenWithPayload) {
      return;
    }

    this.seenVariables.set(variableKey, [
      ...variablePayloads,
      sanitizedTrackVariableProperties,
    ]);

    // TODO: this does nothing for now, we need to implement how track variables to 3rd party plugins
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
