import { Reference, logger } from '@ninetailed/experience.js-shared';
import {
  Audience,
  Experience,
  ExperienceMapper as DefaultExperienceMapper,
} from '@ninetailed/experience.js-utils';

import { AudienceEntry } from '../types/AudienceEntry';
import { BaselineWithExperiencesEntry } from '../types/BaselineWithExperiencesEntry';
import { EntryLike } from '../types/Entry';
import type { EntryFields } from '../types/EntryFields';
import { ExperienceEntry, ExperienceEntryLike } from '../types/ExperienceEntry';
import type { ExperienceFields } from '../types/ExperienceEntry';
import { ExperimentEntry } from '../types/ExperimentEntry';

function mapAudience(ctfAudienceEntry: AudienceEntry): Audience {
  return {
    id: ctfAudienceEntry.fields.nt_audience_id,
    name: ctfAudienceEntry.fields.nt_name,
    description: ctfAudienceEntry.fields.nt_description || '',
  };
}

function createExperience<Variant extends Reference>(
  fields: ExperienceFields,
  variants: Variant[]
): Experience<Variant> {
  const {
    nt_name,
    nt_description,
    nt_type,
    nt_audience,
    nt_config,
    nt_experience_id,
  } = fields;

  return {
    // By the time we reach here, nt_experience_id is guaranteed to be defined thanks to zod validations in validateExperienceEntry
    id: nt_experience_id,
    name: nt_name,
    description: nt_description || '',
    type: nt_type,
    ...(nt_audience ? { audience: mapAudience(nt_audience) } : {}),
    config: nt_config,
    variants,
  };
}

function validateExperienceEntry<VariantFields extends EntryFields>(
  entry: ExperienceEntryLike<VariantFields>
): ExperienceEntry<VariantFields> {
  const parsedExperience = ExperienceEntry.safeParse(entry);
  if (!parsedExperience.success) {
    logger.warn(
      '[Ninetailed Contentful ExperienceMapper]',
      'Error parsing experience',
      parsedExperience.error.format()
    );
    throw new Error(
      `[Ninetailed Contentful ExperienceMapper] The Experience Input is not valid. Please filter data first with "ExperienceMapper.isExperienceEntry".\n${JSON.stringify(
        parsedExperience.error.format(),
        null,
        2
      )}`
    );
  }
  return parsedExperience.data;
}

export type MapVariantFunction<
  In extends EntryFields,
  Out extends Reference
> = (input: EntryLike<In>) => Out;

export type MapVariantFunctionAsync<
  In extends EntryFields,
  Out extends Reference
> = (input: EntryLike<In>) => Promise<Out>;

export class ExperienceMapper {
  static isExperienceEntry<VariantFields extends EntryFields>(
    entry: ExperienceEntryLike<VariantFields>
  ): entry is ExperienceEntry<VariantFields> {
    return ExperienceEntry.safeParse(entry).success;
  }

  /**
   * Maps a Contentful Ninetailed Experience Entry to a format compatible with the Experience.js SDK.
   *
   * @param ctfEntry A Contentful Ninetailed Experience Entry
   */
  static mapExperience<VariantFields extends EntryFields>(
    ctfEntry: ExperienceEntryLike<VariantFields>
  ) {
    const { fields } = validateExperienceEntry(ctfEntry);
    const variants = fields.nt_variants.map((variant) => ({
      ...variant,
      id: variant.sys.id,
    }));
    const experience = createExperience(fields, variants);
    return DefaultExperienceMapper.mapExperience(experience);
  }

  /**
   *
   * Maps a Contentful Ninetailed Experience Entry to a format compatible with the Experience.js SDK
   * using a custom mapping function for the Experience's variants.
   *
   * @param ctfEntry A Contentful Ninetailed Experience Entry
   * @param mapFn  A custom function to map the Experience's variants
   */
  static mapCustomExperience<
    Variant extends Reference,
    VariantFields extends EntryFields
  >(
    ctfEntry: ExperienceEntryLike<VariantFields>,
    mapFn: MapVariantFunction<VariantFields, Variant>
  ) {
    const { fields } = validateExperienceEntry(ctfEntry);
    const variants = fields.nt_variants.map(mapFn);
    const experience = createExperience(fields, variants);
    return DefaultExperienceMapper.mapExperience(experience);
  }

  /**
   * Similar to `mapCustomExperience` but supports asynchronous mapping functions.
   * @see mapCustomExperience
   */
  static async mapCustomExperienceAsync<
    Variant extends Reference,
    VariantFields extends EntryFields
  >(
    ctfEntry: ExperienceEntryLike<VariantFields>,
    mapFn: MapVariantFunctionAsync<VariantFields, Variant>
  ) {
    const { fields } = validateExperienceEntry(ctfEntry);
    const variants = await Promise.all(fields.nt_variants.map(mapFn));
    const experience = createExperience(fields, variants);
    return DefaultExperienceMapper.mapExperience(experience);
  }

  static isExperiment(entry: ExperienceEntryLike): entry is ExperimentEntry {
    return ExperimentEntry.safeParse(entry).success;
  }

  static mapExperiment(entry: ExperienceEntryLike) {
    return ExperienceMapper.mapCustomExperience(entry, () => ({
      id: '',
    }));
  }

  static mapBaselineWithExperiences<Fields extends EntryFields>(
    entry: BaselineWithExperiencesEntry<Fields>
  ) {
    return entry.fields.nt_experiences
      .filter(ExperienceMapper.isExperienceEntry)
      .map((experience) => ExperienceMapper.mapExperience(experience));
  }
}
