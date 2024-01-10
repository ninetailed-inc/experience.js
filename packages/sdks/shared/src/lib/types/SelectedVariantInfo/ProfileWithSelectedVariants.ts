import { Profile } from '../Profile/Profile';
import { SelectedVariantInfo } from './SelectedVariantInfo';

export type ProfileWithSelectedVariants = {
  profile: Profile;
  experiences: SelectedVariantInfo[];
};
