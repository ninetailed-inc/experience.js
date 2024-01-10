import { v4 as uuid } from 'uuid';
import {
  buildPageEvent,
  NINETAILED_ANONYMOUS_ID_COOKIE,
  NinetailedApiClient,
  NinetailedRequestContext,
  Profile,
} from '@ninetailed/experience.js-shared';

type Cookies = Record<string, string>;

type GetServerSideProfileOptions = {
  ctx: NinetailedRequestContext;
  cookies: Cookies;
  client: NinetailedApiClient;
};

export const getServerSideProfile = async ({
  ctx,
  cookies,
  client,
}: GetServerSideProfileOptions): Promise<Profile> => {
  const anonymousIdCookieString = cookies[NINETAILED_ANONYMOUS_ID_COOKIE];
  const anonymousId = anonymousIdCookieString
    ? decodeURIComponent(anonymousIdCookieString)
    : uuid();

  const pageEvent = buildPageEvent({
    ctx,
    messageId: uuid(),
    timestamp: Date.now(),
    properties: {},
  });

  const { profile } = await client.upsertProfile({
    events: [pageEvent],
    profileId: anonymousId,
  });

  return profile;
};
