import { Object } from 'ts-toolbelt';
import { type SharedEventProperties } from './SharedEventProperties';

export type ComponentHoverEvent = Object.Merge<
  SharedEventProperties,
  {
    type: 'component_hover';
    componentType: 'Entry';
    componentId: string;
    hoverId: string;
    hoverDurationMs: number;
    experienceId?: string;
    variantIndex?: number;
  }
>;
