import { Audience } from '@ninetailed/experience.js-utils';
import { AudienceEntry } from '../types/AudienceEntry';
import type { AudienceEntryLike } from '../types/AudienceEntry';

export class AudienceMapper {
  static isAudienceEntry = (
    entry: AudienceEntryLike
  ): entry is AudienceEntry => {
    return AudienceEntry.safeParse(entry).success;
  };

  static mapAudience(audience: AudienceEntry): Audience {
    return {
      id: audience.fields.nt_audience_id,
      name: audience.fields.nt_name || '',
      description: audience.fields.nt_description || '',
    };
  }
}
