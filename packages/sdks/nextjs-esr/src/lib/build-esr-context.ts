import type { NextRequest } from 'next/server';
import { NinetailedRequestContext } from '@ninetailed/experience.js-shared';

import { absoluteUrl } from './absolute-url';

const getLocale = (req: NextRequest): string => {
  try {
    return req.nextUrl.locale;
  } catch (error) {
    return req.nextUrl.defaultLocale || '';
  }
};

export const buildNinetailedEdgeRequestContext = ({
  req,
}: {
  req: NextRequest;
}): NinetailedRequestContext => {
  const url = new URL(
    `${req.nextUrl.pathname}${req.nextUrl.search}`,
    absoluteUrl(req).origin
  );

  return {
    url: url.toString(),
    locale: getLocale(req),
    referrer: req.headers.get('referer') || '',
    userAgent: req.headers.get('user-agent') || '',
  };
};
