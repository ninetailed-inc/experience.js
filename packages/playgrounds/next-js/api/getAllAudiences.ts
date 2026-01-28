import {
  AudienceEntry,
  AudienceMapper,
} from '@ninetailed/experience.js-utils-contentful';
import { contentfulClient } from './contentful-client';

export const getAllAudiences = async () => {
  try {
    const entries = await contentfulClient.getEntries<
      AudienceEntry & { contentTypeId: 'nt_audience' }
    >({
      content_type: 'nt_audience',
      include: 1,
    });

    return entries.items
      .filter(AudienceMapper.isAudienceEntry)
      .map(AudienceMapper.mapAudience);
  } catch (error) {
    console.error(error);
    return [];
  }
};
