import { v4 as uuid } from 'uuid';
import {
  Profile,
  GeoLocation,
  NinetailedRequestContext,
  buildPageEvent,
  NinetailedApiClient,
  NINETAILED_ANONYMOUS_ID_COOKIE,
} from '@ninetailed/experience.js-shared';

type Cookies = { [key: string]: string };

type GetServerSideProfileOptions = {
  ctx: NinetailedRequestContext;
  cookies: Cookies;
  clientId: string;
  environment?: string;
  url?: string;
  ip?: string;
  location?: GeoLocation;
};

export const fetchEdgeProfile = async ({
  ctx,
  cookies,
  clientId,
  environment,
  url,
  ip,
  location,
}: GetServerSideProfileOptions): Promise<Profile> => {
  const anonymousId = cookies[NINETAILED_ANONYMOUS_ID_COOKIE];
  const apiClient = new NinetailedApiClient({ clientId, environment, url });

  const pageEvent = buildPageEvent({
    ctx,
    messageId: uuid(),
    timestamp: Date.now(),
    properties: {},
    location,
  });

  const { profile } = await apiClient.upsertProfile(
    { events: [pageEvent], profileId: anonymousId },
    {
      ip,
      preflight: true,
    }
  );

  return profile;
};
