import type {
  ChainModifiers,
  Entry,
  EntryFieldType,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from 'contentful';

/**
 * ---------------------------------------------
 * Generic "unknown entry" (safer than any)
 * ---------------------------------------------
 *
 * If you have a reference field that can link to "any entry type" (like nt_variants),
 * this gives you a generic entry shape without falling back to `Entry<any, any, any>`.
 *
 * - Keys are unknown (`string`)
 * - Values are constrained to Contentful-supported field types (EntryFieldType)
 */
export interface IGenericEntryFields {
  [fieldId: string]: EntryFieldType<EntrySkeletonType>;
}

export type IGenericEntrySkeleton = EntrySkeletonType<
  IGenericEntryFields,
  string
>;

export type IGenericEntry<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IGenericEntrySkeleton, Modifiers, Locales>;

/**
 * ---------- Banner ----------
 */
export interface IBannerFields {
  /** Internal title */
  internalTitle: EntryFieldTypes.Symbol;

  /** Text */
  text: EntryFieldTypes.RichText;

  /** Link text */
  linkText: EntryFieldTypes.Symbol;

  /** slug */
  slug: EntryFieldTypes.Symbol;

  /** Ninetailed */
  nt_experiences?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<INtExperienceSkeleton>
  >;
}

export type IBannerSkeleton = EntrySkeletonType<IBannerFields, 'banner'>;

export type IBanner<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IBannerSkeleton, Modifiers, Locales>;

/**
 * ---------- Button ----------
 */
export interface IButtonFields {
  /** Internal name */
  internalName: EntryFieldTypes.Symbol;

  /** Button text */
  buttonText: EntryFieldTypes.Symbol;

  /** Icon */
  icon?: EntryFieldTypes.AssetLink;

  /** Variant */
  variant: EntryFieldTypes.Symbol<'primary' | 'secondary' | 'loud'>;

  /** slug */
  slug: EntryFieldTypes.Symbol;
}

export type IButtonSkeleton = EntrySkeletonType<IButtonFields, 'button'>;

export type IButton<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IButtonSkeleton, Modifiers, Locales>;

/**
 * ---------- CTA ----------
 */
export interface ICtaFields {
  /** Internal name */
  internalName: EntryFieldTypes.Symbol;

  /** Headline */
  headline: EntryFieldTypes.RichText;

  /** Subline */
  subline?: EntryFieldTypes.RichText;

  /** Buttons */
  buttons: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<IButtonSkeleton>>;

  /** Ninetailed */
  nt_experiences?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<INtExperienceSkeleton>
  >;
}

export type ICtaSkeleton = EntrySkeletonType<ICtaFields, 'cta'>;

export type ICta<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<ICtaSkeleton, Modifiers, Locales>;

/**
 * ---------- Feature ----------
 */
export interface IFeatureFields {
  /** Internal name */
  internalName?: EntryFieldTypes.Symbol;

  /** Headline */
  headline: EntryFieldTypes.RichText;

  /** Subline */
  subline?: EntryFieldTypes.RichText;

  /** Button */
  button: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<IButtonSkeleton>>;

  /** Image */
  image: EntryFieldTypes.AssetLink;

  /** Image position */
  imagePosition?: EntryFieldTypes.Symbol<'right' | 'left'>;

  /** Ninetailed */
  nt_experiences?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<INtExperienceSkeleton>
  >;
}

export type IFeatureSkeleton = EntrySkeletonType<IFeatureFields, 'feature'>;

export type IFeature<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IFeatureSkeleton, Modifiers, Locales>;

/**
 * ---------- Footer ----------
 */
export interface IFooterFields {
  /** Internal title */
  internalTitle: EntryFieldTypes.Symbol;

  /** Footer links */
  footerLinks: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<IButtonSkeleton>
  >;

  /** Copyright */
  copyright: EntryFieldTypes.RichText;
}

export type IFooterSkeleton = EntrySkeletonType<IFooterFields, 'footer'>;

export type IFooter<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IFooterSkeleton, Modifiers, Locales>;

/**
 * ---------- Form ----------
 */
export interface IFormFields {
  /** Internal Name */
  internalName?: EntryFieldTypes.Symbol;
}

export type IFormSkeleton = EntrySkeletonType<IFormFields, 'form'>;

export type IForm<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IFormSkeleton, Modifiers, Locales>;

/**
 * ---------- Hero ----------
 */
export interface IHeroFields {
  /** Internal name */
  internalName?: EntryFieldTypes.Symbol;

  /** Headline */
  headline: EntryFieldTypes.RichText;

  /** Subline */
  subline?: EntryFieldTypes.RichText;

  /** Buttons */
  buttons: EntryFieldTypes.Array<EntryFieldTypes.EntryLink<IButtonSkeleton>>;

  /** Image */
  image: EntryFieldTypes.AssetLink;

  /** Ninetailed */
  nt_experiences?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<INtExperienceSkeleton>
  >;
}

export type IHeroSkeleton = EntrySkeletonType<IHeroFields, 'hero'>;

export type IHero<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IHeroSkeleton, Modifiers, Locales>;

/**
 * ---------- Hubspot Form ----------
 */
export interface IHubspotFormFields {
  /** Internal Name */
  internalName: EntryFieldTypes.Symbol;

  /** Hubspot Form ID */
  hubspotFormId: EntryFieldTypes.Symbol;

  /** Hubspot Portal ID */
  hubspotPortalId: EntryFieldTypes.Symbol;
}

/** Connect a Hubspot form using its unique GUID and portal ID. */
export type IHubspotFormSkeleton = EntrySkeletonType<
  IHubspotFormFields,
  'hubspotForm'
>;

export type IHubspotForm<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IHubspotFormSkeleton, Modifiers, Locales>;

/**
 * ---------- Landing Page ----------
 */
export interface ILandingPageFields {
  /** Internal Name */
  name?: EntryFieldTypes.Symbol;

  /** Banner */
  banner?: EntryFieldTypes.EntryLink<IBannerSkeleton>;

  /** Navigation */
  navigation?: EntryFieldTypes.EntryLink<INavigationSkeleton>;

  /** Sections */
  sections: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<
      | ICtaSkeleton
      | IFeatureSkeleton
      | IFormSkeleton
      | IHeroSkeleton
      | IHubspotFormSkeleton
      | IPricingTableSkeleton
    >
  >;

  /** Footer */
  footer?: EntryFieldTypes.EntryLink<IFooterSkeleton>;
}

export type ILandingPageSkeleton = EntrySkeletonType<
  ILandingPageFields,
  'landingPage'
>;

export type ILandingPage<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<ILandingPageSkeleton, Modifiers, Locales>;

/**
 * ---------- Navigation ----------
 */
export interface INavigationFields {
  /** Internal title */
  internalTitle?: EntryFieldTypes.Symbol;

  /** Navigation links */
  navigationLinks: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<IButtonSkeleton>
  >;
}

export type INavigationSkeleton = EntrySkeletonType<
  INavigationFields,
  'navigation'
>;

export type INavigation<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<INavigationSkeleton, Modifiers, Locales>;

/**
 * ---------- NT Audience ----------
 */
export interface INtAudienceFields {
  /** Name */
  nt_name: EntryFieldTypes.Symbol;

  /** Description */
  nt_description?: EntryFieldTypes.Text;

  /** Rules */
  nt_rules: EntryFieldTypes.Object;

  /** Audience Id */
  nt_audience_id: EntryFieldTypes.Symbol;
}

/** Ninetailed Audience */
export type INtAudienceSkeleton = EntrySkeletonType<
  INtAudienceFields,
  'nt_audience'
>;

export type INtAudience<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<INtAudienceSkeleton, Modifiers, Locales>;

/**
 * ---------- NT Experience ----------
 */
export interface INtExperienceFields {
  /** Name */
  nt_name: EntryFieldTypes.Symbol;

  /** Description */
  nt_description?: EntryFieldTypes.Text;

  /** Type */
  nt_type: EntryFieldTypes.Symbol<'nt_experiment' | 'nt_personalization'>;

  /** Config */
  nt_config: EntryFieldTypes.Object;

  /** Audience */
  nt_audience?: EntryFieldTypes.EntryLink<INtAudienceSkeleton>;

  /** Variants (generic) */
  nt_variants?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<IGenericEntrySkeleton>
  >;

  nt_experience_id: EntryFieldTypes.Symbol;
}

/** Ninetailed Experience */
export type INtExperienceSkeleton = EntrySkeletonType<
  INtExperienceFields,
  'nt_experience'
>;

export type INtExperience<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<INtExperienceSkeleton, Modifiers, Locales>;

/**
 * ---------- NT Mergetag ----------
 */
export interface INtMergetagFields {
  /** Name */
  nt_name: EntryFieldTypes.Symbol;

  /** Fallback */
  nt_fallback?: EntryFieldTypes.Symbol;

  /** Merge Tag Id */
  nt_mergetag_id: EntryFieldTypes.Symbol;
}

/** Ninetailed Merge Tag */
export type INtMergetagSkeleton = EntrySkeletonType<
  INtMergetagFields,
  'nt_mergetag'
>;

export type INtMergetag<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<INtMergetagSkeleton, Modifiers, Locales>;

/**
 * ---------- Page ----------
 */
export interface IPageFields {
  /** Internal name */
  name: EntryFieldTypes.Symbol;

  /** Page title */
  title: EntryFieldTypes.Symbol;

  /** Slug */
  slug: EntryFieldTypes.Symbol;

  /** SEO metadata */
  seo?: EntryFieldTypes.EntryLink<ISeoSkeleton>;

  /** Content */
  content: EntryFieldTypes.EntryLink<ILandingPageSkeleton>;
}

/** Represents a web page in Compose. DO NOT DELETE */
export type IPageSkeleton = EntrySkeletonType<IPageFields, 'page'>;

export type IPage<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IPageSkeleton, Modifiers, Locales>;

/**
 * ---------- Pricing Plan ----------
 */
export interface IPricingPlanFields {
  /** Internal name */
  internalName?: EntryFieldTypes.Symbol;

  /** Title */
  title: EntryFieldTypes.RichText;

  /** Price */
  price: EntryFieldTypes.RichText;

  /** Frequency */
  frequency?: EntryFieldTypes.Symbol<'/month' | '/week' | '/day'>;

  /** Discounted price */
  discountedPrice?: EntryFieldTypes.RichText;

  /** Description */
  description?: EntryFieldTypes.RichText;

  /** Button */
  button: EntryFieldTypes.EntryLink<IButtonSkeleton>;

  /** Most popular */
  mostPopular?: EntryFieldTypes.Boolean;
}

export type IPricingPlanSkeleton = EntrySkeletonType<
  IPricingPlanFields,
  'pricingPlan'
>;

export type IPricingPlan<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IPricingPlanSkeleton, Modifiers, Locales>;

/**
 * ---------- Pricing Table ----------
 */
export interface IPricingTableFields {
  /** Internal name */
  internalName?: EntryFieldTypes.Symbol;

  /** Headline */
  headline: EntryFieldTypes.RichText;

  /** Subline */
  subline: EntryFieldTypes.RichText;

  /** Pricing plans */
  pricingPlans: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<IPricingPlanSkeleton>
  >;

  /** Ninetailed */
  nt_experiences?: EntryFieldTypes.Array<
    EntryFieldTypes.EntryLink<INtExperienceSkeleton>
  >;
}

export type IPricingTableSkeleton = EntrySkeletonType<
  IPricingTableFields,
  'pricingTable'
>;

export type IPricingTable<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<IPricingTableSkeleton, Modifiers, Locales>;

/**
 * ---------- SEO ----------
 */
export interface ISeoFields {
  /** Internal name */
  name: EntryFieldTypes.Symbol;

  /** SEO title */
  title?: EntryFieldTypes.Symbol;

  /** Description */
  description?: EntryFieldTypes.Text;

  /** Keywords */
  keywords?: EntryFieldTypes.Array<EntryFieldTypes.Symbol>;

  /** Hide page from search engines (noindex) */
  no_index?: EntryFieldTypes.Boolean;

  /** Exclude links from search rankings? (nofollow) */
  no_follow?: EntryFieldTypes.Boolean;
}

/** SEO Metadata for web pages in Compose. DO NOT DELETE */
export type ISeoSkeleton = EntrySkeletonType<ISeoFields, 'seo'>;

export type ISeo<
  Modifiers extends ChainModifiers = DEFAULT_MODIFIERS,
  Locales extends LocaleCode = LOCALE_CODE
> = Entry<ISeoSkeleton, Modifiers, Locales>;

/**
 * ---------- Misc ----------
 */
export type CONTENT_TYPE =
  | 'banner'
  | 'button'
  | 'cta'
  | 'feature'
  | 'footer'
  | 'form'
  | 'hero'
  | 'hubspotForm'
  | 'landingPage'
  | 'navigation'
  | 'nt_audience'
  | 'nt_experience'
  | 'nt_mergetag'
  | 'page'
  | 'pricingPlan'
  | 'pricingTable'
  | 'seo';

export type DEFAULT_MODIFIERS = 'WITHOUT_UNRESOLVABLE_LINKS';

export type LOCALE_CODE = 'en-US';
export type CONTENTFUL_DEFAULT_LOCALE_CODE = 'en-US';
