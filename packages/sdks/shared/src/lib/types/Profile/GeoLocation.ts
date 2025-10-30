import { z } from 'zod';

import countries from 'i18n-iso-countries';

export const Alpha2Code = z.enum([
  'unknown',
  ...Object.keys(countries.getAlpha2Codes()),
]);
export type Alpha2Code = z.infer<typeof Alpha2Code>;

export const GeoLocation = z.object({
  coordinates: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  region: z.string().optional(),
  regionCode: z.string().optional(),
  country: z.string().optional(),
  countryCode: Alpha2Code.optional(),
  continent: z.string().optional(),
  timezone: z.string().optional(),
});
export type GeoLocation = z.infer<typeof GeoLocation>;
