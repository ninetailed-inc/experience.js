import { z } from 'zod';
import { Profile } from '../Profile/Profile';
import { SelectedVariantInfo } from '../SelectedVariantInfo/SelectedVariantInfo';
import { withResponseEnvelope } from './shared';
import { Change } from '../Change';

export const GetProfileResponse = withResponseEnvelope(
  z.object({
    profile: Profile,
    experiences: z.array(SelectedVariantInfo),
    // TODO: Remove default once the API sends it
    changes: z.array(Change).default([]),
  })
);
export type GetProfileResponse = z.infer<typeof GetProfileResponse>;
