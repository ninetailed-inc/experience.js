import { Object } from 'ts-toolbelt';
import { type SharedEventProperties } from './SharedEventProperties';

export type ComponentViewEvent = Object.Merge<
  SharedEventProperties,
  {
    type: 'component';
    componentType: string;
    componentId: string;
    experienceId?: string;
    variantIndex?: number;
  }
>;
