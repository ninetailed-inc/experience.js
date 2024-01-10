import { NextRequest } from 'next/server';

export function absoluteUrl(
  req: NextRequest,
  localhostAddress = 'localhost:3000'
) {
  const hostHeader = req.headers.get('host') as string;
  let host = hostHeader ? hostHeader : localhostAddress;
  let protocol = /^localhost(:\d+)?$/.test(host) ? 'http:' : 'https:';

  if (
    req &&
    req.headers.get('x-forwarded-host') &&
    typeof req.headers.get('x-forwarded-host') === 'string'
  ) {
    host = req.headers.get('x-forwarded-host') as string;
  }

  if (
    req &&
    req.headers.get('x-forwarded-proto') &&
    typeof req.headers.get('x-forwarded-proto') === 'string'
  ) {
    protocol = `${req.headers.get('x-forwarded-proto')}:`;
  }

  return {
    protocol,
    host,
    origin: protocol + '//' + host,
  };
}
