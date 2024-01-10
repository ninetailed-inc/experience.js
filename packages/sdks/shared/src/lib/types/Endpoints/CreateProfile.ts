import { z } from 'zod';
import { Profile } from '../Profile/Profile';
import { RequestBodyOptions } from './RequestBodyOptions';
import { SelectedVariantInfo } from '../SelectedVariantInfo/SelectedVariantInfo';
import { withResponseEnvelope } from './shared';

export const CreateProfileRequestBody = z.object({
  events: z.array(z.unknown()).min(1),
  options: RequestBodyOptions.optional(),
});
export type CreateProfileRequestBody = z.infer<typeof CreateProfileRequestBody>;

export const CreateProfileResponse = withResponseEnvelope(
  z.object({
    profile: Profile,
    experiences: z.array(SelectedVariantInfo),
  })
);
export type CreateProfileResponse = z.infer<typeof CreateProfileResponse>;
