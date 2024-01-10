import type { GeoLocation } from '../Profile/GeoLocation';
import type { Campaign } from './Campaign';
import type { EventType } from './EventType';
import type { Page } from './Page';

export type EventChanel = 'mobile' | 'web' | 'server';

export type SharedEventProperties = {
  channel: EventChanel;
  context: {
    app?: {
      name: string;
      version: string;
    };
    campaign: Campaign;
    library: { name: string; version: string };
    locale: string;
    page: Page;
    userAgent?: string;
    gdpr: {
      isConsentGiven: boolean;
    };
    location?: GeoLocation;
  };
  messageId: string;
  originalTimestamp: string;
  timestamp: string;
  sentAt: string;
  type: EventType;
  userId?: string;
};
