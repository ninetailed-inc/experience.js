import type { Entry, EntryFieldTypes, EntrySkeletonType } from 'contentful';

/** Your custom methods (optional so real CDA entries still type-check) */
type EntryMethods = {
  toPlainObject?: () => object;
  update?: () => Promise<unknown>;
};

/**
 * Recursively adds EntryMethods to every Contentful Entry found inside `T`.
 * - Recurse into `fields` (so linked entries get the methods too)
 * - Recurse into arrays (for multi-reference fields)
 * - Leave everything else alone (keeps JSON/object fields and your variants generic)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WithEntryMethods<T> = T extends Entry<any, any, any>
  ? Omit<T, 'fields'> & {
      fields: {
        [K in keyof T['fields']]: WithEntryMethods<T['fields'][K]>;
      };
    } & EntryMethods
  : T extends Array<infer U>
  ? Array<WithEntryMethods<U>>
  : T;

/** Convenience alias for your preferred modifiers/locales */
type CtflEntry<S extends EntrySkeletonType> = WithEntryMethods<
  Entry<S, 'WITHOUT_UNRESOLVABLE_LINKS', string>
>;

/**
 * ---------- NT Audience ----------
 */
export interface INtAudienceFields {
  nt_name: EntryFieldTypes.Symbol;
  nt_rules: EntryFieldTypes.Object; // JSON
  nt_audience_id: EntryFieldTypes.Symbol;
}

export type INtAudienceSkeleton = EntrySkeletonType<
  INtAudienceFields,
  'nt_audience'
>;
export type INtAudience = CtflEntry<INtAudienceSkeleton>;

/**
 * ---------- NT Experience ----------
 */
export interface INtExperienceFields {
  nt_name: EntryFieldTypes.Symbol;
  nt_description: EntryFieldTypes.Text;
  nt_type: EntryFieldTypes.Symbol;
  nt_experience_id: EntryFieldTypes.Symbol;

  nt_config: EntryFieldTypes.Object; // JSON
  nt_audience: EntryFieldTypes.EntryLink<INtAudienceSkeleton>;

  nt_variants: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<EntrySkeletonType>
  >;
}

export type INtExperienceSkeleton = EntrySkeletonType<
  INtExperienceFields,
  'nt_experience'
>;
export type INtExperience = CtflEntry<INtExperienceSkeleton>;

/**
 * ---------- Hero ----------
 */
export interface IHeroFields {
  name: EntryFieldTypes.Symbol;
  nt_experiences: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<INtExperienceSkeleton>
  >;
}

export type IHeroSkeleton = EntrySkeletonType<IHeroFields, 'hero'>;
export type IHero = CtflEntry<IHeroSkeleton>;
