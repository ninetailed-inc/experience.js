import { Object } from 'ts-toolbelt';
import { type SharedEventProperties } from '@ninetailed/experience.js-shared';

export type ComponentViewEvent = Object.Merge<
  SharedEventProperties,
  {
    type: 'component';
    componentId: string;
    experienceId?: string;
    variantIndex?: number;
  }
>;
