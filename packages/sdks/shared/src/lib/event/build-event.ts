import type { SharedEventProperties } from '../types/Event/SharedEventProperties';
import type { EventType } from '../types/Event/EventType';
import type { NinetailedRequestContext } from '../types/Event/NinetailedRequestContext';
import type { GeoLocation } from '../types/Profile/GeoLocation';
import { buildCampaign } from './build-campaign';
import { buildPage } from './build-page';

export type BuildEventArgs = {
  messageId: string;
  timestamp: number;
  type: EventType;
  ctx: NinetailedRequestContext;
  location?: GeoLocation;
};

export const buildEvent = ({
  messageId,
  timestamp,
  type,
  ctx,
  location,
}: BuildEventArgs): SharedEventProperties => {
  const date = new Date(timestamp).toISOString();

  return {
    channel: 'web',
    context: {
      library: {
        name: 'Ninetailed React Analytics SDK',
        version: process.env['NX_PACKAGE_VERSION'] || '0.0.0',
      },
      userAgent: ctx.userAgent,
      campaign: buildCampaign(ctx),
      locale: ctx.locale,
      page: buildPage(ctx),
      gdpr: {
        isConsentGiven: true,
      },
      location,
    },
    messageId: messageId,
    originalTimestamp: date,
    timestamp: date,
    sentAt: date,
    type,
  };
};
