// import { NextFetchEvent, NextResponse } from 'next/server';

// import {
//   getEdgeSideProfile,
//   NINETAILED_PROFILE_CACHE_COOKIE,
// } from './get-edge-side-profile';
// import { buildEsrNinetailedRequestContext } from './build-esr-context';

// type NinetailedPersonalizationMiddlewareOptions = {
//   apiKey: string;
// };

// export const enhanceEdgeRequest = async (
//   event: NextFetchEvent,
//   { apiKey }: NinetailedPersonalizationMiddlewareOptions
// ) => {
//   const { request: req } = event;
//   if ((req.nextUrl.pathname || '').indexOf('.') > -1) {
//     return { url: req.url };
//   }

//   try {
//     const { profile, cache } = await getEdgeSideProfile({
//       ctx: buildEsrNinetailedRequestContext({ req }),
//       apiKey: apiKey,
//       cookies: req.cookies,
//       ip: req.ip,
//       location: {
//         city: req.geo.city,
//         region: req.geo.region,
//         country: req.geo.country,
//       },
//     });

//     req.nextUrl.searchParams.set('ninetailed', JSON.stringify({ profile }));

//     return {
//       url: req.nextUrl,
//       cookie: {
//         key: NINETAILED_PROFILE_CACHE_COOKIE,
//         value: JSON.stringify(cache),
//       },
//     };
//   } catch (error) {
//     return { url: req.nextUrl };
//   }
// };

// export const NinetailedPersonalizationMiddleware = (
//   options: NinetailedPersonalizationMiddlewareOptions
// ) => async (event: NextFetchEvent) => {
//   const { url, cookie } = await enhanceEdgeRequest(event, options);

//   if (url) {
//     const res = NextResponse.rewrite(url);
//     if (cookie) {
//       res.cookie(cookie.key, cookie.value);
//     }

//     return res;
//   }

//   return NextResponse.next();
// };
