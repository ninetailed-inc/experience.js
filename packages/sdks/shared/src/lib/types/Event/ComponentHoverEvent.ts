import { Object } from 'ts-toolbelt';
import { type SharedEventProperties } from './SharedEventProperties';

export type ComponentHoverEventComponentType = 'Entry' | 'Variable';

export type ComponentHoverEvent = Object.Merge<
  SharedEventProperties,
  {
    type: 'component_hover';
    componentType: ComponentHoverEventComponentType;
    componentId: string;
    componentHoverId: string;
    hoverDurationMs: number;
    experienceId?: string;
    variantIndex?: number;
  }
>;
