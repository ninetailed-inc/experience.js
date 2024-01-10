import { z } from 'zod';
import { Profile } from '../Profile/Profile';
import { SelectedVariantInfo } from '../SelectedVariantInfo/SelectedVariantInfo';
import { withResponseEnvelope } from './shared';

export const GetProfileResponse = withResponseEnvelope(
  z.object({
    profile: Profile,
    experiences: z.array(SelectedVariantInfo),
  })
);
export type GetProfileResponse = z.infer<typeof GetProfileResponse>;
