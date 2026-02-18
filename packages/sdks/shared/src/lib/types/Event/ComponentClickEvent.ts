import { Object } from 'ts-toolbelt';
import { type SharedEventProperties } from './SharedEventProperties';

export type ComponentClickEventComponentType = 'Entry' | 'Variable';

export type ComponentClickEvent = Object.Merge<
  SharedEventProperties,
  {
    type: 'component_click';
    componentType: ComponentClickEventComponentType;
    componentId: string;
    experienceId?: string;
    variantIndex?: number;
  }
>;
