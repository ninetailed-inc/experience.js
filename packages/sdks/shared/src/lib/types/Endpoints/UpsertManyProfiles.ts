import { z } from 'zod';
import { Profile } from '../Profile/Profile';
import { RequestBodyOptions } from './RequestBodyOptions';
import { withResponseEnvelope } from './shared';

export const UpsertManyProfilesRequestBody = z.object({
  events: z.array(z.unknown()).min(1),
  options: RequestBodyOptions.optional(),
});
export type UpsertManyProfilesRequestBody = z.infer<
  typeof UpsertManyProfilesRequestBody
>;

export const UpsertManyProfilesResponse = withResponseEnvelope(
  z.object({ profiles: z.array(Profile).optional() })
);
export type UpsertManyProfilesResponse = z.infer<
  typeof UpsertManyProfilesResponse
>;
