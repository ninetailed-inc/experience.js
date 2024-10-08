import {
  EXPERIENCES_FALLBACK_CACHE,
  PROFILE_CHANGE,
  PROFILE_FALLBACK_CACHE,
} from '@ninetailed/experience.js-shared';
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
    console.log('payload', payload);

    if (payload.error || !payload.profile || !payload.experiences) {
      // TODO we could check if the in memory state is already there and if the fallback cache needs to get read from localstorage

      const fallbackProfile = this.cache.getItem(PROFILE_FALLBACK_CACHE);
      const fallbackExperiences =
        this.cache.getItem(EXPERIENCES_FALLBACK_CACHE) || [];

      if (fallbackProfile) {
        this.state = {
          ...this.state,
          status: 'success',
          profile: fallbackProfile,
          experiences: fallbackExperiences,
          error: null,
        };
      } else {
        this.state = {
          ...this.state,
          status: 'error',
          profile: null,
          experiences: null,
          error:
            payload.error || new Error('Profile or experiences are missing'),
        };
      }
    } else {
      this.state = {
        ...this.state,
        status: 'success',
        profile: payload.profile,
        experiences: payload.experiences,
        error: null,
      };

      this.cache.setItem(PROFILE_FALLBACK_CACHE, this.state.profile);
      this.cache.setItem(EXPERIENCES_FALLBACK_CACHE, this.state.experiences);
    }

    console.log('Profile state updated', this.state);
    console.log('Listeners', this.profilfeListeners);

    this.profilfeListeners.forEach((cb) => cb(this.state));
  }

  public getProfileState() {
    return this.state;
  }
}
