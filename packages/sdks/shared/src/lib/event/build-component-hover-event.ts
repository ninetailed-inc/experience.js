import { Object } from 'ts-toolbelt';

import type { ComponentHoverEvent } from '../types/Event/ComponentHoverEvent';
import { type BuildEventArgs, buildEvent } from './build-event';

export type BuildComponentHoverEventData = Object.Omit<
  Object.Merge<
    BuildEventArgs,
    {
      componentId: string;
      componentType: 'Entry';
      componentHoverId: string;
      hoverDurationMs: number;
      experienceId?: string;
      variantIndex?: number;
    },
    'deep'
  >,
  'type'
>;

export const buildComponentHoverEvent = (
  data: BuildComponentHoverEventData
): ComponentHoverEvent => {
  return {
    ...buildEvent({ ...data, type: 'component_hover' }),
    componentType: data.componentType,
    componentId: data.componentId,
    componentHoverId: data.componentHoverId,
    hoverDurationMs: data.hoverDurationMs,
    experienceId: data.experienceId,
    variantIndex: data.variantIndex,
  };
};
