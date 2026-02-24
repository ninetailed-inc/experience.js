import { Object } from 'ts-toolbelt';
import { type SharedEventProperties } from './SharedEventProperties';

export type ComponentClickEvent = Object.Merge<
  SharedEventProperties,
  {
    type: 'component_click';
    componentType: 'Entry';
    componentId: string;
    experienceId?: string;
    variantIndex?: number;
  }
>;
