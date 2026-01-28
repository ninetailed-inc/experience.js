import {
  ExperienceEntry,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';
import { contentfulClient } from './contentful-client';

export const getAllExperiences = async () => {
  try {
    const entries = await contentfulClient.getEntries<
      ExperienceEntry & { contentTypeId: 'nt_experience' }
    >({
      content_type: 'nt_experience',
      include: 1,
    });

    return entries.items
      .filter(ExperienceMapper.isExperienceEntry)
      .map(ExperienceMapper.mapExperience);
  } catch (error) {
    console.error(error);
    return [];
  }
};
