import {
  ContentfulClientApi,
  createClient,
  Entry,
  EntrySkeletonType,
  FieldsType,
} from 'contentful';
import {
  DEFAULT_MODIFIERS,
  INtAudienceSkeleton,
  INtExperienceSkeleton,
  IPage,
  IPageSkeleton,
} from '@/types/contentful';
import {
  AudienceMapper,
  ExperienceEntryLike,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';

const contentfulClient = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_TOKEN ?? '',
  environment: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT ?? 'master',
}).withoutUnresolvableLinks;

const previewClient = createClient({
  space: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ?? '',
  accessToken: process.env.NEXT_PUBLIC_CONTENTFUL_PREVIEW_TOKEN ?? '',
  host: 'preview.contentful.com',
}).withoutUnresolvableLinks;

const getClient = (
  preview: boolean
): ContentfulClientApi<DEFAULT_MODIFIERS> => {
  return preview ? previewClient : contentfulClient;
};

interface IPageQueryParams {
  slug: string;
  pageContentType: string;
  childPageContentType: string;
  preview?: boolean;
}

export async function getPage(pageParams: IPageQueryParams): Promise<IPage> {
  const client = getClient(!!pageParams.preview);
  const entries = await client.getEntries<IPageSkeleton>({
    limit: 1,
    include: 10,
    'fields.slug': pageParams.slug,
    content_type: 'page',
    'fields.content.sys.contentType.sys.id': pageParams.childPageContentType,
  });
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

export async function getEntry<T extends FieldsType>(
  entryParams: IEntryQueryParams
) {
  const query = getEntryQuery(entryParams);
  const client = getClient(!!entryParams.preview);
  const entries = await client.getEntries<EntrySkeletonType<T>>(query);
  const [entry = null] = entries.items as Entry<EntrySkeletonType<T>>[];
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
  const entries = await client.getEntries<IPageSkeleton>(query);
  const pages = entries.items as IPage[];

  return pages || [];
}

export async function getExperiments() {
  try {
    const client = getClient(false);
    const entries = await client.getEntries<INtExperienceSkeleton>({
      content_type: 'nt_experience',
      'fields.nt_type': 'nt_experiment',
      include: 1,
    });
    return (entries.items as unknown as ExperienceEntryLike[])
      .filter(ExperienceMapper.isExperienceEntry)
      .map(ExperienceMapper.mapExperiment);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export const getAllExperiences = async () => {
  try {
    const entries = await contentfulClient.getEntries<INtExperienceSkeleton>({
      content_type: 'nt_experience',
      include: 1,
    });
    return (entries.items as unknown as ExperienceEntryLike[])
      .filter(ExperienceMapper.isExperienceEntry)
      .map(ExperienceMapper.mapExperience);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getAllAudiences = async () => {
  try {
    const entries = await contentfulClient.getEntries<INtAudienceSkeleton>({
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
