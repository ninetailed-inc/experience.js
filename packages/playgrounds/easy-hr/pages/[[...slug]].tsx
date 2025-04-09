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
} from '@/lib/api';
import { PAGE_CONTENT_TYPES } from '@/lib/constants';
import { IPage } from '@/types/contentful';
import { CustomFlag } from '@/components/CustomFlagTest/CustomFlagTest';

const Page = ({ page }: { page: IPage }) => {
  if (!page) {
    return null;
  }

  const {
    banner,
    navigation,
    sections = [],
    footer,
  } = page.fields.content.fields;

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
          <CustomFlag
            flagKey="candy-lover"
            defaultValue="false"
            options={{
              experienceId: '50aPkYQHko6Rr5bGI2LBMY',
            }}
          >
            {({ value, status, error }) => {
              // Extract the actual value if we're getting a wrapped object with a value property
              let displayValue;

              if (
                typeof value === 'object' &&
                value !== null &&
                'value' in value
              ) {
                // If the value is an object with a "value" property, use that
                displayValue = value.value;
              } else {
                // Otherwise use the value directly
                displayValue = value;
              }

              // Convert to string for display if it's still an object
              if (typeof displayValue === 'object' && displayValue !== null) {
                displayValue = JSON.stringify(displayValue);
              }

              return (
                <div>
                  <h1>Candy Lover: {displayValue}</h1>
                  <p>Status: {status}</p>
                  {error && <p>Error: {error.message || String(error)}</p>}
                </div>
              );
            }}
          </CustomFlag>
          {/* @ts-ignore */}
          <BlockRenderer block={sections} />
        </main>
        {/* @ts-ignore */}

        {footer && <BlockRenderer block={footer} />}
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps = async ({ params, preview }) => {
  const rawSlug = get(params, 'slug', []) as string[];
  const slug = rawSlug.join('/');

  const [page, experiments, experiences, audiences] = await Promise.all([
    getPage({
      slug: slug === '' ? '/' : slug,
      pageContentType: PAGE_CONTENT_TYPES.PAGE,
      childPageContentType: PAGE_CONTENT_TYPES.LANDING_PAGE,
    }),
    getExperiments(),
    getAllExperiences(),
    getAllAudiences(),
  ]);

  return {
    props: {
      page,
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
