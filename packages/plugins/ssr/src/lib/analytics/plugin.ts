import Cookies from 'js-cookie';
import {
  ANONYMOUS_ID,
  NINETAILED_ANONYMOUS_ID_COOKIE,
  PROFILE_CHANGE,
  PROFILE_RESET,
} from '@ninetailed/experience.js-shared';

import {
  AnalyticsInstance,
  type ProfileChangedPayload,
  type InterestedInProfileChange,
} from '@ninetailed/experience.js';
import {
  EventHandler,
  NinetailedPlugin,
} from '@ninetailed/experience.js-plugin-analytics';

type NinetailedSsrPluginOptions = {
  cookie?: {
    domain?: string;
    /**
     * Determines the expiration date of the cookie as the number of days until the cookie expires.
     */
    expires?: number;
  };
};

export class NinetailedSsrPlugin
  extends NinetailedPlugin
  implements InterestedInProfileChange
{
  public name = 'ninetailed:ssr';

  private cookieDomain?: string;
  private cookieExpires?: number;

  constructor({ cookie }: NinetailedSsrPluginOptions = {}) {
    super();

    this.cookieDomain = cookie?.domain;
    this.cookieExpires = cookie?.expires;
  }

  public initialize = ({ instance }: { instance: AnalyticsInstance }) => {
    const anonymousId = Cookies.get(NINETAILED_ANONYMOUS_ID_COOKIE);

    if (anonymousId) {
      instance.storage.setItem(ANONYMOUS_ID, anonymousId);
    }
  };

  public [PROFILE_CHANGE]: EventHandler<ProfileChangedPayload> = ({
    payload,
  }) => {
    if (payload.profile) {
      const cookieAttributes: Cookies.CookieAttributes = {
        expires: this.cookieExpires || 365,
      };

      if (this.cookieDomain) {
        cookieAttributes.domain = this.cookieDomain;
      }

      Cookies.set(
        NINETAILED_ANONYMOUS_ID_COOKIE,
        payload.profile.id,
        cookieAttributes
      );
    }
  };

  public [PROFILE_RESET]: EventHandler = () => {
    Cookies.remove(NINETAILED_ANONYMOUS_ID_COOKIE);
  };
}
