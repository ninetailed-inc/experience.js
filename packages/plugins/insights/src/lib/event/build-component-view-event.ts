import { Object } from 'ts-toolbelt';
import {
  type BuildEventArgs,
  buildEvent,
} from '@ninetailed/experience.js-shared';

import { type ComponentViewEvent } from '../types/Event/ComponentViewEvent';

type BuildComponentViewEventData = Object.Omit<
  Object.Merge<
    BuildEventArgs,
    {
      componentId: string;
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
    componentId: data.componentId,
    experienceId: data.experienceId,
    variantIndex: data.variantIndex,
  };
};
