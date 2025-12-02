import { Entry } from 'contentful';

export interface INtAudienceFields {
  /** Name */
  nt_name: string;

  /** Description */
  nt_description?: string | undefined;

  /** Rules */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nt_rules: Record<string, any>;

  /** Audience Id */
  nt_audience_id: string;
}

/** Ninetailed Audience */

export interface INtAudience extends Entry<INtAudienceFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'nt_audience';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface INtExperienceFields {
  /** Name */
  nt_name: string;

  /** Description */
  nt_description?: string | undefined;

  /** Type */
  nt_type: 'nt_experiment' | 'nt_personalization';

  /** Config */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nt_config: Record<string, any>;

  /** Audience */
  nt_audience?: INtAudience | undefined;

  /** Variants */
  nt_variants?: Entry<{ [fieldId: string]: unknown }>[] | undefined;

  nt_experience_id: string;
}

/** Ninetailed Experience */

export interface INtExperience extends Entry<INtExperienceFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'nt_experience';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}

export interface IHeroFields {
  /** Name */
  name: string;

  /** Ninetailed */
  nt_experiences?: INtExperience[] | undefined;
}

export interface IHero extends Entry<IHeroFields> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        id: 'hero';
        linkType: 'ContentType';
        type: 'Link';
      };
    };
  };
}
