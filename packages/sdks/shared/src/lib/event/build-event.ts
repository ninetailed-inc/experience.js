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

/**
 * @description This function takes an object `BuildEventArgs` and maps it to a new
 * object with additional properties based on the information provided in the event
 * object. Specifically, it:
 * 
 * 1/ Extracts the date and time from the `timestamp` property of the event object
 * using the `Date` constructor and the `toISOString()` method.
 * 2/ Creates a new object with the following properties:
 * 		- `channel`: set to `'web'`
 * 		- `context`: an object with properties for various context information, including
 * `library`, `userAgent`, `campaign`, `locale`, `page`, and `gdpr`
 * 		- `messageId`: the same as in the event object
 * 		- `originalTimestamp`: the original date and time from the event object
 * 		- `timestamp`: the current date and time in ISO format
 * 		- `sentAt`: the date and time when the event was sent (i.e., when the function
 * was called) in ISO format
 * 		- `type`: the same as in the event object
 * 3/ Returns the new object.
 * 
 * @param { BuildEventArgs } .messageId - The `.messageId` input parameter in this
 * function is used to store a unique identifier for the event. It serves as an
 * internal ID that can be used to distinguish between different events of the same
 * type.
 * 
 * @param { BuildEventArgs } .timestamp - .timestamp is used to convert the "timestamp"
 * object passed into the function to a Date object in ISO string format. This allows
 * for comparisons between events to be done correctly and easily, as dates are easier
 * to work with when in the same format.
 * 
 * @param { BuildEventArgs } .type - In the provided code snippet, `.type` is a
 * parameter in the `SharedEventProperties` function that represents the event type
 * or category of the build event. It specifies the type of data that the function
 * is expected to process and return as part of the event properties.
 * 
 * The value of `.type` determines which of several possible event categories the
 * function will operate on, such as "pageview", "click", "form submit", or others.
 * This parameter allows the code to handle different types of events differently and
 * provide context-specific information for each type.
 * 
 * @param { BuildEventArgs } .ctx - The .ctx input parameter in the provided function
 * is used to access context information from the event payload. In particular, it
 * provides access to the `userAgent`, `locale`, `page`, and `campaign` properties
 * of the event's context object.
 * 
 * @param { BuildEventArgs } .location - In this function, the `.location` input
 * parameter is used to extract the location information of the event. It could be a
 * latitude and longitude pair or a more complex location object like `navigator.geolocation`.
 * The purpose of this parameter is to provide additional context for the event data,
 * allowing for more accurate tracking and analysis of user behavior.
 * 
 * @returns { SharedEventProperties } This function returns an object with properties
 * for a shared event in a web analytics platform like Google Analytics. The output
 * includes information about the event, such as the channel, context, messageId,
 * originalTimestamp, timestamp, sentAt, and type.
 * 
 * The context property includes various details about the user's device and environment,
 * such as the user agent, campaign, locale, page, and GDPR consent status. The
 * location property contains the actual location of the event, which can be a URL
 * or other identifier.
 * 
 * In summary, this function creates a standardized event object that can be used to
 * track and analyze events in a web analytics platform.
 */
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
