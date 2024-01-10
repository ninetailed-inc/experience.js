import { NinetailedRequestContext } from '@ninetailed/experience.js-shared';

import { buildClientLocale } from './build-locale';

export const buildClientNinetailedRequestContext =
  (): NinetailedRequestContext => ({
    url: window.location.href,
    referrer: document.referrer,
    locale: buildClientLocale(),
    userAgent: navigator.userAgent,
    document: {
      title: document.title,
    },
  });
