import { ContentfulClientApi, createClient, Entry } from 'contentful';
import { IPage, IPageFields } from '@/types/contentful';
import {
  AudienceEntryLike,
  AudienceMapper,
  ExperienceEntryLike,
  ExperienceMapper,
  ExperimentEntry,
  isEntry,
} from '@ninetailed/experience.js-utils-contentful';

const contentfulClient = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_TOKEN ?? '',
  environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'master',
});

const previewClient = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_TOKEN ?? '',
  host: 'preview.contentful.com',
});

const getClient = (preview: boolean): ContentfulClientApi => {
  return preview ? previewClient : contentfulClient;
};

interface IPageQueryParams {
  slug: string;
  pageContentType: string;
  childPageContentType: string;
  preview?: boolean;
}

const getPageQuery = (pageParams: IPageQueryParams) => {
  return {
    limit: 1,
    include: 10,
    'fields.slug': pageParams.slug,
    content_type: pageParams.pageContentType,
    'fields.content.sys.contentType.sys.id': pageParams.childPageContentType,
  };
};

export async function getPage(pageParams: IPageQueryParams): Promise<IPage> {
  const query = getPageQuery(pageParams);
  const client = getClient(!!pageParams.preview);
  const entries = await client.getEntries<IPageFields>(query);
  const [page] = entries.items as IPage[];
  return page;
}

interface IEntryQueryParams {
  name: string;
  contentType: string;
  preview?: boolean;
}

const getEntryQuery = (entryParams: IEntryQueryParams) => {
  return {
    limit: 1,
    include: 10,
    'fields.internalName': entryParams.name,
    content_type: entryParams.contentType,
  };
};

export async function getEntry<T>(entryParams: IEntryQueryParams) {
  const query = getEntryQuery(entryParams);
  const client = getClient(!!entryParams.preview);
  const entries = await client.getEntries<T>(query);
  const [entry = null] = entries.items as Entry<T>[];
  return entry;
}

interface IPagesOfTypeQueryParams {
  pageContentType: string;
  childPageContentType: string;
  preview?: boolean;
}
const getTypesOfPageQuery = (pageParams: IPagesOfTypeQueryParams) => {
  return {
    limit: 100,
    content_type: pageParams.pageContentType,
    'fields.content.sys.contentType.sys.id': pageParams.childPageContentType,
  };
};

export async function getPagesOfType(
  pageParams: IPagesOfTypeQueryParams
): Promise<IPage[]> {
  const query = getTypesOfPageQuery(pageParams);
  const client = getClient(!!pageParams.preview);
  const entries = await client.getEntries<IPageFields>(query);
  const pages = entries.items as IPage[];

  return pages || [];
}

export async function getExperiments() {
  const query = {
    content_type: 'nt_experience',
    'fields.nt_type': 'nt_experiment',
  };
  const client = getClient(false);
  const entries = await client.getEntries(query);
  const experiments = entries.items as ExperimentEntry[];

  const mappedExperiments = (experiments || []).filter(isEntry).map((entry) => {
    return ExperienceMapper.mapExperiment(entry);
  });

  return mappedExperiments;
}

export const getAllExperiences = async () => {
  try {
    const entries = await contentfulClient.getEntries({
      content_type: 'nt_experience',
      include: 1,
    });
    return (entries.items as ExperienceEntryLike[])
      .filter(ExperienceMapper.isExperienceEntry)
      .map(ExperienceMapper.mapExperience);
  } catch (error) {
    console.error(error);
    return [];
  }
};

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
