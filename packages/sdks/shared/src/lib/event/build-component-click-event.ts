import { Object } from 'ts-toolbelt';

import type { ComponentClickEvent } from '../types/Event/ComponentClickEvent';
import { type BuildEventArgs, buildEvent } from './build-event';

export type BuildComponentClickEventData = Object.Omit<
  Object.Merge<
    BuildEventArgs,
    {
      componentId: string;
      componentType: 'Entry';
      experienceId?: string;
      variantIndex?: number;
    },
    'deep'
  >,
  'type'
>;

export const buildComponentClickEvent = (
  data: BuildComponentClickEventData
): ComponentClickEvent => {
  return {
    ...buildEvent({ ...data, type: 'component_click' }),
    componentType: data.componentType,
    componentId: data.componentId,
    experienceId: data.experienceId,
    variantIndex: data.variantIndex,
  };
};
