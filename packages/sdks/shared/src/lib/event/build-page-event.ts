import { Object } from 'ts-toolbelt';

import type { PageviewEvent } from '../types/Event/PageviewEvent';
import type { Properties } from '../types/Event/Properties';
import { buildEvent, BuildEventArgs } from './build-event';
import { buildPage } from './build-page';

type BuildPageEventArgs = Object.Omit<
  Object.Merge<
    BuildEventArgs,
    {
      properties: Properties;
    },
    'deep'
  >,
  'type'
>;

export const buildPageEvent = (data: BuildPageEventArgs): PageviewEvent => {
  return {
    ...buildEvent({ ...data, type: 'page' }),
    properties: {
      ...data.properties,
      ...buildPage(data.ctx),
      title: data.ctx.document?.title || '',
    },
  };
};
