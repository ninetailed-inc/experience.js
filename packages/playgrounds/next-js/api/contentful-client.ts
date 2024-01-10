import { createClient } from 'contentful';

export const contentfulClient = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_TOKEN ?? '',
  environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'master',
});
