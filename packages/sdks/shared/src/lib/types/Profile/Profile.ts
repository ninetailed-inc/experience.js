import { z } from 'zod';

import { SessionStatistics } from '../Session/SessionStatistics';
import { GeoLocation } from './GeoLocation';
import { Traits } from './Traits';

export const Profile = z.object({
  id: z.string(),
  stableId: z.string(),
  random: z.number(),
  audiences: z.array(z.string()),
  traits: Traits,
  location: GeoLocation,
  session: SessionStatistics,
});
export type Profile = z.infer<typeof Profile>;

export declare type Variant<P> = {
  id: string;
  audience: {
    id: string;
  };
} & P;
