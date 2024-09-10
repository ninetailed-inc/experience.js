import {
  BuildPageEventArgs,
  BuildTrackEventArgs,
  IdentifyEventArgs,
  NinetailedRequestContext,
  Properties,
  buildComponentViewEvent,
  buildIdentifyEvent,
  buildPageEvent,
  buildTrackEvent,
} from '@ninetailed/experience.js-shared';
import { v4 as uuid } from 'uuid';
import { buildClientNinetailedRequestContext } from '../NinetailedCorePlugin';

export class EventBuilder {
  private readonly buildRequestContext: () => NinetailedRequestContext;

  constructor(buildRequestContext?: () => NinetailedRequestContext) {
    this.buildRequestContext =
      buildRequestContext || buildClientNinetailedRequestContext;
  }

  public page(
    properties?: Properties,
    data?: Partial<Omit<BuildPageEventArgs, 'ctx' | 'properties'>>
  ) {
    return buildPageEvent({
      messageId: data?.messageId || uuid(),
      timestamp: Date.now(),
      ...data,
      properties: properties || {},
      ctx: this.buildRequestContext(),
    });
  }

  public track(
    event: string,
    properties?: Properties,
    data?: Partial<Omit<BuildTrackEventArgs, 'ctx' | 'event' | 'properties'>>
  ) {
    return buildTrackEvent({
      messageId: data?.messageId || uuid(),
      timestamp: Date.now(),
      ...data,
      event,
      properties: properties || {},
      ctx: this.buildRequestContext(),
    });
  }

  public identify(
    userId: string,
    traits?: Properties,
    data?: Partial<Omit<IdentifyEventArgs, 'ctx' | 'userId' | 'traits'>>
  ) {
    return buildIdentifyEvent({
      messageId: data?.messageId || uuid(),
      timestamp: Date.now(),
      ...data,
      traits: traits || {},
      userId: userId || '',
      ctx: this.buildRequestContext(),
    });
  }

  public component(
    componentId: string,
    experienceId?: string,
    variantIndex?: number,
    data?: Partial<
      Omit<
        BuildPageEventArgs,
        'ctx' | 'componentId' | 'experienceId' | 'variantIndex'
      >
    >
  ) {
    return buildComponentViewEvent({
      messageId: data?.messageId || uuid(),
      timestamp: Date.now(),
      ...data,
      componentId,
      experienceId: experienceId || '',
      variantIndex: variantIndex || 0,
      ctx: this.buildRequestContext(),
    });
  }
}
