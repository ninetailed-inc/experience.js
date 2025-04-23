import { z } from 'zod';
import { Profile } from '../Profile/Profile';
import { SelectedVariantInfo } from '../SelectedVariantInfo/SelectedVariantInfo';
import { withResponseEnvelope } from './shared';
import { Change } from '../Change';

export const GetProfileResponse = withResponseEnvelope(
  z.object({
    profile: Profile,
    experiences: z.array(SelectedVariantInfo),
    changes: z.array(Change),
  })
);
export type GetProfileResponse = z.infer<typeof GetProfileResponse>;
