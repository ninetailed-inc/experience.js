import { PROFILE_CHANGE } from '@ninetailed/experience.js-shared';
import {
  Storage,
  ProfileState,
  AnalyticsInstance,
  ProfileChangedPayload,
} from './types';

export class ProfileStateManager {
  private readonly cache: Storage;

  private state: ProfileState = {
    status: 'loading',
    profile: null,
    experiences: null,
    error: null,
    from: 'api',
  };

  public constructor(instance: AnalyticsInstance) {
    this.cache = instance.storage;
    instance.on(
      PROFILE_CHANGE,
      ({ payload }: { payload: ProfileChangedPayload }) => {
        this.setProfileState(payload);
      }
    );
  }

  public onProfileChange(cb: (profile: ProfileState) => void) {
    this.profilfeListeners.push(cb);

    return () => {
      this.profilfeListeners = this.profilfeListeners.filter(
        (listener) => listener !== cb
      );
    };
  }

  private profilfeListeners: ((profile: ProfileState) => void)[] = [];

  private setProfileState(payload: ProfileChangedPayload) {
    if (payload.error) {
      this.state = {
        ...this.state,
        status: 'error',
        profile: null,
        experiences: null,
        error: payload.error,
      };
    } else if (!payload.profile || !payload.experiences) {
      this.state = {
        ...this.state,
        status: 'error',
        profile: null,
        experiences: null,
        error: new Error('Profile or experiences are missing'),
      };
    } else {
      this.state = {
        ...this.state,
        status: 'success',
        profile: payload.profile,
        experiences: payload.experiences,
        error: null,
      };
    }

    this.profilfeListeners.forEach((cb) => cb(this.state));
  }

  public getProfileState() {
    return this.state;
  }
}
