import { Object } from 'ts-toolbelt';

import type { IdentifyEvent } from '../types/Event/IdentifyEvent';
import type { Traits } from '../types/Profile/Traits';
import { buildEvent, BuildEventArgs } from './build-event';

export type IdentifyEventArgs = Object.Omit<
  Object.Merge<
    BuildEventArgs,
    {
      userId: string;
      traits: Traits;
    }
  >,
  'type'
>;

export const buildIdentifyEvent = (data: IdentifyEventArgs): IdentifyEvent => {
  return {
    ...buildEvent({ ...data, type: 'identify' }),
    traits: data.traits,
    userId: data.userId,
  };
};
