/* eslint-disable @typescript-eslint/ban-ts-comment */
import { GetStaticPaths, GetStaticProps } from 'next';
import { NextSeo } from 'next-seo';
import { get } from 'radash';

import { BlockRenderer } from '@/components/Renderer';
import {
  getPagesOfType,
  getPage,
  getExperiments,
  getAllExperiences,
  getAllAudiences,
  getEntry,
} from '@/lib/api';
import { PAGE_CONTENT_TYPES } from '@/lib/constants';
import { ICta, IPage } from '@/types/contentful';
import { Variable } from '@/components/Variable/Variable';
import { CTA } from '@/components/Cta';
import { EntryAnalytics } from '@ninetailed/experience.js-react';

const Page = ({ page, entry }: { page: IPage; entry: ICta }) => {
  if (!page) {
    return null;
  }

  const {
    banner,
    navigation,
    sections = [],
    footer,
  } = page.fields.content?.fields ?? {};

  return (
    <>
      <NextSeo
        title={page.fields.seo?.fields.title || page.fields.title}
        description={page.fields.seo?.fields.description}
        nofollow={page.fields.seo?.fields.no_follow as boolean}
        noindex={page.fields.seo?.fields.no_index as boolean}
      />

      <div className="w-full h-full flex flex-col">
        {/* @ts-ignore */}
        {banner && <BlockRenderer block={banner} />}

        {/* @ts-ignore */}
        {navigation && <BlockRenderer block={navigation} />}

        <main className="grow">
          <Variable />

          {/* @ts-ignore */}
          <BlockRenderer block={sections} />

          {entry && (
            <EntryAnalytics {...entry} component={CTA} id={entry.sys.id} />
          )}
        </main>

        {/* @ts-ignore */}
        {footer && <BlockRenderer block={footer} />}
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const rawSlug = get(params, 'slug', []) as string[];
  const slug = rawSlug.join('/');

  const [page, entry, experiments, experiences, audiences] = await Promise.all([
    getPage({
      slug: slug === '' ? '/' : slug,
      pageContentType: PAGE_CONTENT_TYPES.PAGE,
      childPageContentType: PAGE_CONTENT_TYPES.LANDING_PAGE,
    }),
    getEntry<ICta>({
      name: 'Arbitrary CTA',
      contentType: 'cta',
    }),
    getExperiments(),
    getAllExperiences(),
    getAllAudiences(),
  ]);

  return {
    props: {
      page,
      entry,
      ninetailed: {
        experiments,
        preview: { experiences, audiences },
      },
    },
    revalidate: 5,
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const pages = await getPagesOfType({
    pageContentType: PAGE_CONTENT_TYPES.PAGE,
    childPageContentType: PAGE_CONTENT_TYPES.LANDING_PAGE,
  });

  const paths = pages
    .filter((page) => {
      return page.fields.slug !== '/';
    })
    .map((page) => {
      return {
        params: { slug: page.fields.slug.split('/') },
      };
    });
  return {
    paths: [...paths, { params: { slug: [''] } }],
    fallback: true,
  };
};

export default Page;
