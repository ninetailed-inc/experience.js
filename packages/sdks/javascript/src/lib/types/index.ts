import {
  Logger,
  PageviewProperties,
  Profile,
  Properties,
  Traits,
  SelectedVariantInfo,
} from '@ninetailed/experience.js-shared';
import { DetachListeners } from 'analytics';

import { TrackComponentProperties } from './TrackingProperties';
import { NinetailedPlugin } from './NinetailedPlugin';
import { type Ninetailed } from '../Ninetailed';
import { ElementSeenPayload } from './ElementSeenPayload';

type Loading = {
  status: 'loading';
  profile: null;
  experiences: null;
  error: null;
};

type Success = {
  status: 'success';
  profile: Profile;
  experiences: SelectedVariantInfo[];
  error: null;
};

type Fail = {
  status: 'error';
  profile: null;
  experiences: null;
  error: Error;
};

export type ProfileState = {
  from: 'api' | 'hydrated';
} & (Loading | Success | Fail);

export type OnIsInitializedCallback = () => void;

export type OnIsInitialized = (cb: OnIsInitializedCallback) => void;

export type EventFunctionOptions = {
  plugins?: {
    all: boolean;
    [key: string]: boolean;
  };
};

export type FlushResult = { success: boolean };

export type OnProfileChangeCallback = (profile: ProfileState) => void;

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
  properties: ElementSeenPayload
) => Promise<void>;

export type Identify = (
  uid: string,
  traits?: Traits,
  options?: EventFunctionOptions
) => Promise<FlushResult>;

export type Reset = () => void;

export type Debug = (enable: boolean) => void;

export type OnProfileChange = (cb: OnProfileChangeCallback) => DetachListeners;

type ObserveElement = Ninetailed['observeElement'];
type UnObserveElement = Ninetailed['unobserveElement'];

export interface NinetailedInstance {
  page: Page;
  track: Track;
  /**
   * @deprecated
   */
  trackHasSeenComponent: TrackHasSeenComponent;
  trackComponentView: TrackComponentView;
  identify: Identify;
  reset: Reset;
  debug: Debug;
  profileState: ProfileState;
  onProfileChange: OnProfileChange;
  plugins: NinetailedPlugin[];
  logger: Logger;
  onIsInitialized: OnIsInitialized;
  observeElement: ObserveElement;
  unobserveElement: UnObserveElement;
}

export { NinetailedPlugin, TrackComponentProperties };

export type { EventHandler } from './EventHandler';

export type { AnalyticsInstance } from './AnalyticsInstance';

export { ElementSeenPayloadSchema } from './ElementSeenPayload';
export type { ElementSeenPayload } from './ElementSeenPayload';

export type { ProfileChangedPayload } from './ProfileChangedPayload';

export type { Credentials } from './Credentials';
