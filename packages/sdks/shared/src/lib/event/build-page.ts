import type { NinetailedRequestContext } from '../types/Event/NinetailedRequestContext';
import type { Page } from '../types/Event/Page';
import { buildQuery } from './build-query';

export const buildPage = (ctx: NinetailedRequestContext): Page => {
  try {
    const query = buildQuery(ctx.url);
    const url = new URL(ctx.url);

    return {
      path: url.pathname,
      query,
      referrer: ctx.referrer,
      search: url.search,
      url: ctx.url,
    };
  } catch (error) {
    return {
      path: '',
      query: {},
      referrer: '',
      search: '',
      url: '',
    };
  }
};
