import type { Profile, Change } from '@ninetailed/experience.js-shared';

export type ProfileChangedPayload = {
  profile: Profile | null;
  changes: Change[] | null;
};
