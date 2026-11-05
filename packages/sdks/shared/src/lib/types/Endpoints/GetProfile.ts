import { z } from 'zod';
import { Profile } from '../Profile/Profile';
import { SelectedVariantInfo } from '../SelectedVariantInfo/SelectedVariantInfo';
import { withResponseEnvelope } from './shared';
import { Changes } from '../Change';

export const GetProfileResponse = withResponseEnvelope(
  z.object({
    profile: Profile,
    experiences: z.array(SelectedVariantInfo),
    changes: Changes,
  })
);
export type GetProfileResponse = z.infer<typeof GetProfileResponse>;
