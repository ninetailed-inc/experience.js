import { Object } from 'ts-toolbelt';

import {
  ComponentViewEventComponentType,
  type ComponentViewEvent,
} from '../types/Event/ComponentViewEvent';
import { type BuildEventArgs, buildEvent } from './build-event';

export type BuildComponentViewEventData = Object.Omit<
  Object.Merge<
    BuildEventArgs,
    {
      componentId: string;
      componentType: ComponentViewEventComponentType;
      experienceId?: string;
      variantIndex?: number;
    },
    'deep'
  >,
  'type'
>;

export const buildComponentViewEvent = (
  data: BuildComponentViewEventData
): ComponentViewEvent => {
  return {
    ...buildEvent({ ...data, type: 'component' }),
    componentType: data.componentType,
    componentId: data.componentId,
    experienceId: data.experienceId,
    variantIndex: data.variantIndex,
  };
};
