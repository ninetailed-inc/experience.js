import { DetachListeners } from 'analytics';
import {
  Logger,
  PageviewProperties,
  Profile,
  Properties,
  Traits,
  SelectedVariantInfo,
  Reference,
  Event,
  Change,
} from '@ninetailed/experience.js-shared';
import {
  ElementSeenPayload,
  VariableSeenPayload,
  NinetailedPlugin,
  TrackComponentProperties,
} from '@ninetailed/experience.js-plugin-analytics';

import { type Ninetailed } from '../Ninetailed';
import { OnSelectVariant } from './OnSelectVariant';
import { EventBuilder } from '../utils/EventBuilder';

export type ProfileState =
  | {
      status: 'loading';
      profile: null;
      experiences: null;
      changes: null;
      error: null;
      from: 'api' | 'hydrated';
    }
  | {
      status: 'success';
      profile: Profile;
      experiences: SelectedVariantInfo[];
      changes: Change[];
      error: null;
      from: 'api' | 'hydrated';
    }
  | {
      status: 'error';
      profile: Profile | null;
      experiences: SelectedVariantInfo[] | null;
      changes: Change[] | null;
      error: Error;
      from: 'api' | 'hydrated';
    };

export type ChangesState =
  | {
      status: 'loading';
      changes: null;
      error: null;
    }
  | {
      status: 'success';
      changes: Change[];
      error: null;
    }
  | {
      status: 'error';
      changes: null;
      error: Error;
    };

export type OnIsInitializedCallback = () => void;

export type OnIsInitialized = (cb: OnIsInitializedCallback) => void;

export type EventFunctionOptions = {
  plugins?: {
    all: boolean;
    [key: string]: boolean;
  };
};

export type FlushResult = { success: boolean };

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: Error };

export type OnProfileChangeCallback = (profile: ProfileState) => void;

export type OnChangesChangeCallback = (changesState: ChangesState) => void;

export type Page = (
  data?: Partial<PageviewProperties>,
  options?: EventFunctionOptions
) => Promise<FlushResult>;

export type Track = (
  event: string,
  properties?: Properties,
  options?: EventFunctionOptions
) => Promise<FlushResult>;

export type TrackHasSeenComponent = (
  properties: TrackComponentProperties
) => Promise<void>;

export type TrackComponentView = (
  properties: Omit<ElementSeenPayload, 'seenFor'>
) => Promise<void>;

export type TrackVariableComponentView = (
  properties: Omit<VariableSeenPayload, 'seenFor'>
) => Promise<void>;

export type Identify = (
  uid: string,
  traits?: Traits,
  options?: EventFunctionOptions
) => Promise<FlushResult>;

export type Batch = (events: Event[]) => Promise<FlushResult>;

export type Reset = () => void;

export type Debug = (enable: boolean) => void;

export type OnProfileChange = (cb: OnProfileChangeCallback) => DetachListeners;

export type OnChangesChange = (cb: OnChangesChangeCallback) => DetachListeners;

type ObserveElement = Ninetailed['observeElement'];
type UnObserveElement = Ninetailed['unobserveElement'];

export interface NinetailedInstance<
  TBaseline extends Reference = Reference,
  TVariant extends Reference = Reference
> {
  page: Page;
  track: Track;
  /**
   * @deprecated
   */
  trackHasSeenComponent: TrackHasSeenComponent;
  trackComponentView: TrackComponentView;
  trackVariableComponentView: TrackVariableComponentView;
  identify: Identify;
  batch: Batch;
  reset: Reset;
  debug: Debug;
  profileState: ProfileState;
  onProfileChange: OnProfileChange;
  onChangesChange: OnChangesChange;
  plugins: NinetailedPlugin[];
  logger: Logger;
  eventBuilder: EventBuilder;
  onIsInitialized: OnIsInitialized;
  observeElement: ObserveElement;
  unobserveElement: UnObserveElement;
  onSelectVariant: OnSelectVariant<TBaseline, TVariant>;
}

export type { AnalyticsInstance } from './AnalyticsInstance';

export type { ProfileChangedPayload } from './ProfileChangedPayload';

export type { Credentials } from './Credentials';
