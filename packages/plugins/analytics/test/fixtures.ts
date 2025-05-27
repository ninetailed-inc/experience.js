import { ComponentViewEventComponentType } from '../src/lib/ElementSeenPayload';

export const TRACK_COMPONENT_PROPERTIES = {
  variant: {
    id: 'test',
  },
  audience: {
    id: 'test',
  },
  isPersonalized: true,
};

export const TRACK_COMPONENT_VIEW_PROPERTIES = {
  element: document.createElement('div'),
  experience: {
    id: 'test',
    type: 'nt_experiment' as const,
    name: 'test',
    description: 'test',
  },
  audience: {
    id: 'test',
    name: 'test',
    description: 'test',
  },
  variant: {
    id: 'test',
    test: 'test',
  },
  componentType: ComponentViewEventComponentType.Entry,
  variantIndex: 1,
};
