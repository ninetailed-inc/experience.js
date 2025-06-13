import {
  HAS_SEEN_COMPONENT,
  HAS_SEEN_ELEMENT,
  HAS_SEEN_VARIABLE,
} from '@ninetailed/experience.js-plugin-analytics';
import {
  PROFILE_CHANGE,
  Profile,
  SelectedVariantInfo,
  PROFILE_RESET,
  Change,
  SerializableObject,
} from '@ninetailed/experience.js-shared';
import { HAS_SEEN_STICKY_COMPONENT, PAGE_HIDDEN } from '../constants';

type ReadyAction = {
  type: 'ready';
};

type HasSeenElementAction = {
  type: typeof HAS_SEEN_ELEMENT;
  seenFor: number | undefined;
  element: Element;
};

type HasSeenVariableAction = {
  type: typeof HAS_SEEN_VARIABLE;
  variable: SerializableObject;
};

type PageHiddenAction = {
  type: typeof PAGE_HIDDEN;
};

type ProfileChangeAction =
  | {
      type: typeof PROFILE_CHANGE;
      profile: Profile;
      experiences: SelectedVariantInfo[];
      changes: Change[];
      error: undefined | null;
    }
  | {
      type: typeof PROFILE_CHANGE;
      profile: Profile | null;
      experiences: SelectedVariantInfo[];
      changes: Change[];
      error: Error;
    };

type ProfileResetAction = {
  type: typeof PROFILE_RESET;
};

type ProfileHasSeenStickyComponentAction = {
  type: typeof HAS_SEEN_STICKY_COMPONENT;
  componentId: string;
  experienceId: string | undefined;
  variantIndex: number | undefined;
};

type ProfileHasSeenComponentAction = {
  type: typeof HAS_SEEN_COMPONENT;
  variant: { id: string };
  audience: { id: string };
  isPersonalized: boolean;
};

// Union type for all possible actions
export type DispatchAction =
  | ReadyAction
  | ProfileChangeAction
  | ProfileResetAction
  | ProfileHasSeenStickyComponentAction
  | HasSeenElementAction
  | HasSeenVariableAction
  | ProfileHasSeenComponentAction
  | PageHiddenAction;

// This is necessary because when we call `Omit<T, "type">`
// on a discriminated union,
// it breaks the discriminated union (see https://github.com/microsoft/TypeScript/issues/31501)
type RemoveTypeField<Type> = {
  [Property in keyof Type as Exclude<Property, 'type'>]: Type[Property];
};

// Mapping from action type to its associated data
// Utility type to transform each action type into the expected payload format
export type ExtractPayload<T extends { type: string }> = {
  payload: RemoveTypeField<T>;
};

// Dynamically map each action type to its corresponding payload
export type ActionPayloadMap = {
  [A in DispatchAction as A['type']]: ExtractPayload<A>;
};
