export type NinetailedRequestContext = {
  url: string;
  referrer: string;
  locale: string;
  userAgent: string;
  document?: {
    title: string;
  };
};
