import {
  BuildPageEventArgs,
  BuildTrackEventArgs,
  IdentifyEventArgs,
  NinetailedRequestContext,
  Properties,
  buildComponentHoverEvent,
  buildComponentClickEvent,
  buildComponentViewEvent,
  buildIdentifyEvent,
  buildPageEvent,
  buildTrackEvent,
} from '@ninetailed/experience.js-shared';
import { v4 as uuid } from 'uuid';
import { buildClientNinetailedRequestContext } from '../NinetailedCorePlugin';
import type {
  ComponentInteractionEventComponentType,
  ComponentViewEventComponentType,
} from '@ninetailed/experience.js-plugin-analytics';

type PageData = Partial<Omit<BuildPageEventArgs, 'ctx' | 'properties'>>;
type TrackData = Partial<
  Omit<BuildTrackEventArgs, 'ctx' | 'event' | 'properties'>
>;
type IdentifyData = Partial<
  Omit<IdentifyEventArgs, 'ctx' | 'userId' | 'traits'>
>;
type ComponentData = Partial<
  Omit<
    BuildPageEventArgs,
    'ctx' | 'componentId' | 'experienceId' | 'variantIndex'
  >
>;

export class EventBuilder {
  private readonly buildRequestContext: () => NinetailedRequestContext;

  constructor(buildRequestContext?: () => NinetailedRequestContext) {
    this.buildRequestContext =
      buildRequestContext || buildClientNinetailedRequestContext;
  }

  private buildEventBase<
    T extends PageData | TrackData | IdentifyData | ComponentData
  >(data?: T) {
    return {
      messageId: data?.messageId || uuid(),
      ...data,
      timestamp: Date.now(),
      ctx: this.buildRequestContext(),
    };
  }

  public page(properties?: Properties, data?: PageData) {
    return buildPageEvent({
      ...this.buildEventBase(data),
      properties: properties || {},
    });
  }

  public track(event: string, properties?: Properties, data?: TrackData) {
    return buildTrackEvent({
      ...this.buildEventBase(data),
      event,
      properties: properties || {},
    });
  }

  public identify(userId: string, traits?: Properties, data?: IdentifyData) {
    return buildIdentifyEvent({
      ...this.buildEventBase(data),
      traits: traits || {},
      userId: userId || '',
    });
  }

  public component(
    componentId: string,
    componentType: ComponentViewEventComponentType,
    experienceId?: string,
    variantIndex?: number,
    data?: ComponentData
  ) {
    return buildComponentViewEvent({
      ...this.buildEventBase(data),
      componentId,
      componentType: componentType || 'Entry',
      experienceId,
      variantIndex: variantIndex || 0,
    });
  }

  public componentClick(
    componentId: string,
    componentType: ComponentInteractionEventComponentType,
    experienceId?: string,
    variantIndex?: number,
    data?: ComponentData
  ) {
    return buildComponentClickEvent({
      ...this.buildEventBase(data),
      componentId,
      componentType: componentType || 'Entry',
      experienceId,
      variantIndex: variantIndex || 0,
    });
  }

  public componentHover(
    componentId: string,
    componentType: ComponentInteractionEventComponentType,
    hoverDurationMs: number,
    componentHoverId: string,
    experienceId?: string,
    variantIndex?: number,
    data?: ComponentData
  ) {
    return buildComponentHoverEvent({
      ...this.buildEventBase(data),
      componentId,
      componentType: componentType || 'Entry',
      componentHoverId,
      hoverDurationMs,
      experienceId,
      variantIndex: variantIndex || 0,
    });
  }
}
