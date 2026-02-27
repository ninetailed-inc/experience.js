import { Object } from 'ts-toolbelt';
import { type SharedEventProperties } from './SharedEventProperties';

// Adding this here to avoid circular dependency
export type ComponentViewEventComponentType = 'Entry' | 'Variable';

export type ComponentViewEvent = Object.Merge<
  SharedEventProperties,
  {
    type: 'component';
    componentType: ComponentViewEventComponentType;
    componentId: string;
    experienceId?: string;
    variantIndex?: number;
    viewDurationMs?: number;
    componentViewId?: string;
  }
>;
