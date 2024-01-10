import { z } from 'zod';
import { Profile } from '../Profile/Profile';
import { RequestBodyOptions } from './RequestBodyOptions';
import { SelectedVariantInfo } from '../SelectedVariantInfo/SelectedVariantInfo';
import { withResponseEnvelope } from './shared';

export const UpdateProfileRequestBody = z.object({
  events: z.array(z.unknown()).min(1),
  options: RequestBodyOptions.optional(),
});
export type UpdateProfileRequestBody = z.infer<typeof UpdateProfileRequestBody>;

export const UpdateProfileResponse = withResponseEnvelope(
  z.object({
    profile: Profile,
    experiences: z.array(SelectedVariantInfo),
  })
);
export type UpdateProfileResponse = z.infer<typeof UpdateProfileResponse>;
