import {
  AudienceEntryLike,
  AudienceMapper,
} from '@ninetailed/experience.js-utils-contentful';
import { contentfulClient } from './contentful-client';

export const getAllAudiences = async () => {
  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'nt_audience',
      include: 1,
    });

    return (entries.items as AudienceEntryLike[])
      .filter(AudienceMapper.isAudienceEntry)
      .map(AudienceMapper.mapAudience);
  } catch (error) {
    console.error(error);
    return [];
  }
};
