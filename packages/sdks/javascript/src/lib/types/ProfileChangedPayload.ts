import type {
  SelectedVariantInfo,
  Profile,
} from '@ninetailed/experience.js-shared';

export type ProfileChangedPayload = {
  profile?: Profile;
  experiences?: SelectedVariantInfo[];
  error?: Error;
};
