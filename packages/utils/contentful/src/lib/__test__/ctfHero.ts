import { Entry, EntrySkeletonType } from 'contentful';
import {
  IHero,
  IHeroFields,
  INtAudienceFields,
  INtExperienceFields,
} from './contentful-generated-types';

export const ctfHero: IHero = {
  sys: {
    id: '',
    type: 'Entry',
    createdAt: '2022-09-30T12:42:51.595Z',
    updatedAt: '2022-09-30T14:46:40.518Z',
    locale: '',
    contentType: {
      sys: {
        id: 'hero',
        linkType: 'ContentType',
        type: 'Link',
      },
    },
    publishedVersion: 1,
    revision: 1,
    space: { sys: { type: 'Link', linkType: 'Space', id: '' } },
    environment: { sys: { type: 'Link', linkType: 'Environment', id: '' } },
  },
  fields: {
    name: 'Hero',
    nt_experiences: [
      {
        metadata: {
          tags: [],
        },
        sys: {
          id: '1zPgxFzQNPjhvjRKBPr203',
          type: 'Entry' as const,
          createdAt: '2022-09-30T12:42:51.595Z',
          updatedAt: '2022-09-30T14:46:40.518Z',
          contentType: {
            sys: {
              type: 'Link' as const,
              linkType: 'ContentType' as const,
              id: 'nt_experience',
            },
          },
          locale: 'en-US',
          publishedVersion: 1,
          revision: 1,
          space: { sys: { type: 'Link', linkType: 'Space', id: '' } },
          environment: {
            sys: { type: 'Link', linkType: 'Environment', id: '' },
          },
        },
        fields: {
          nt_name: 'are-you-cool',
          nt_description: 'Do you have isCool=true in your query params?',
          nt_type: 'nt_personalization' as const,
          nt_experience_id: '1zPgxFzQNPjhvjRKBPr203',
          nt_config: {
            traffic: 1,
            components: [
              {
                baseline: {
                  id: '2t0zGNkAgnSyhUAFigL1Fe',
                  title: 'Home Page Hero Banner',
                },
                variants: [
                  {
                    id: '6Vlth4dgPIflvvWbGo8yd',
                    hidden: false,
                  },
                ],
              },
            ],
            distribution: [0, 1],
          },
          nt_audience: {
            metadata: {
              tags: [],
            },
            sys: {
              id: '6a26biS02WxlM4WqTiwEZm',
              type: 'Entry' as const,
              createdAt: '2022-09-30T12:40:16.769Z',
              updatedAt: '2022-09-30T12:40:16.769Z',
              contentType: {
                sys: {
                  type: 'Link' as const,
                  linkType: 'ContentType' as const,
                  id: 'nt_audience',
                },
              },
              locale: 'en-US',
              publishedVersion: 1,
              revision: 1,
              space: { sys: { type: 'Link', linkType: 'Space', id: '' } },
              environment: {
                sys: { type: 'Link', linkType: 'Environment', id: '' },
              },
            },
            fields: {
              nt_name: 'Is Cool',
              nt_rules: {
                any: [
                  {
                    all: [
                      {
                        type: 'page',
                        operator: 'greaterThanInclusive',
                        count: '1',
                        value: '',
                        key: '',
                        conditions: [
                          {
                            key: {
                              id: 'context_page_query',
                              value: 'isCool',
                              key: 'context_page_query',
                              category: {
                                name: 'query_parameter',
                                label: 'Query Parameter',
                                type: 'string',
                              },
                              label: 'Query Parameter',
                              useOnce: false,
                            },
                            operator: 'equal',
                            value: 'true',
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              nt_audience_id: '6a26biS02WxlM4WqTiwEZm',
            },
            toPlainObject: function (): object {
              throw new Error('Function not implemented.');
            },
            update: function (): Promise<
              Entry<EntrySkeletonType<INtAudienceFields>>
            > {
              throw new Error('Function not implemented.');
            },
          },
          nt_variants: [
            {
              metadata: {
                tags: [],
              },
              sys: {
                space: {
                  sys: {
                    type: 'Link' as const,
                    linkType: 'Space' as const,
                    id: 'ly5kzv4xdfjq',
                  },
                },
                id: '6Vlth4dgPIflvvWbGo8yd',
                type: 'Entry' as const,
                createdAt: '2022-09-30T12:41:10.265Z',
                updatedAt: '2022-09-30T12:41:10.265Z',
                environment: {
                  sys: {
                    id: 'dev',
                    type: 'Link' as const,
                    linkType: 'Environment' as const,
                  },
                },
                revision: 1,
                contentType: {
                  sys: {
                    type: 'Link' as const,
                    linkType: 'ContentType' as const,
                    id: 'or-creative-content-panel',
                  },
                },
                locale: 'en-US',
                publishedVersion: 1,
              },
              fields: {
                entryTitle: '[Ninetailed Variant] Home Page Hero Banner',
                variant: 'content-left',
                description: {
                  data: {},
                  content: [
                    {
                      data: {},
                      content: [
                        {
                          data: {},
                          marks: [
                            {
                              type: 'bold',
                            },
                          ],
                          value: 'Introducing Heinz vintage Drip',
                          nodeType: 'text',
                        },
                      ],
                      nodeType: 'paragraph',
                    },
                    {
                      data: {},
                      content: [
                        {
                          data: {},
                          marks: [],
                          value:
                            'It’s NYFW and we’ve teamed up with taste-maker @emmachamberlain to drop a limited run of 157 ketchup-stained, vintage swag pieces. Time to add some flavor to your fashion.',
                          nodeType: 'text',
                        },
                      ],
                      nodeType: 'paragraph',
                    },
                  ],
                  nodeType: 'document',
                },
                desktopImage: [
                  {
                    url: 'http://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/f_auto/q_auto/v1660633166/brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-desktop_wvdfoa.png',
                    tags: [],
                    type: 'upload',
                    bytes: 911720,
                    width: 1920,
                    format: 'png',
                    height: 826,
                    context: {
                      custom: {
                        alt: 'lady gazing to the right',
                      },
                    },
                    version: 1660633166,
                    duration: null,
                    metadata: [],
                    public_id:
                      'brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-desktop_wvdfoa',
                    created_at: '2022-08-16T06:59:26Z',
                    secure_url:
                      'https://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/f_auto/q_auto/v1660633166/brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-desktop_wvdfoa.png',
                    original_url:
                      'http://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/v1660633166/brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-desktop_wvdfoa.png',
                    resource_type: 'image',
                    raw_transformation: 'f_auto/q_auto',
                    original_secure_url:
                      'https://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/v1660633166/brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-desktop_wvdfoa.png',
                  },
                ],
                mobileImage: [
                  {
                    url: 'http://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/f_auto/q_auto/v1660633166/brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-mobile_they3j.png',
                    tags: [],
                    type: 'upload',
                    bytes: 647055,
                    width: 768,
                    format: 'png',
                    height: 820,
                    context: {
                      custom: {
                        alt: 'lady gazing to the right',
                      },
                    },
                    version: 1660633166,
                    duration: null,
                    metadata: [],
                    public_id:
                      'brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-mobile_they3j',
                    created_at: '2022-08-16T06:59:26Z',
                    secure_url:
                      'https://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/f_auto/q_auto/v1660633166/brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-mobile_they3j.png',
                    original_url:
                      'http://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/v1660633166/brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-mobile_they3j.png',
                    resource_type: 'image',
                    raw_transformation: 'f_auto/q_auto',
                    original_secure_url:
                      'https://res.cloudinary.com/kraft-heinz-whats-cooking-ca/image/upload/v1660633166/brand-experience/test-images/creative-content-panel/creative-content-panel-hero-banner-mobile_they3j.png',
                  },
                ],
                ctaLink: [
                  {
                    id: '05d26971-eebf-4b89-b459-500e01dc1d0e',
                    url: '/products',
                    type: 'internal-url',
                    label: 'Get on the list',
                  },
                ],
                theme: 'red',
                headline: 'This is Ninetailed.\n<i>wow</i>\n',
                headlineStyle: 'headline-4',
              },
              toPlainObject: function (): object {
                throw new Error('Function not implemented.');
              },
              update: function (): Promise<
                Entry<EntrySkeletonType<{ [fieldId: string]: unknown }>>
              > {
                throw new Error('Function not implemented.');
              },
            },
          ],
        },
        toPlainObject: function (): object {
          throw new Error('Function not implemented.');
        },
        update: function (): Promise<
          Entry<EntrySkeletonType<INtExperienceFields>>
        > {
          throw new Error('Function not implemented.');
        },
      },
    ],
  },
  metadata: {
    tags: [],
  },
  toPlainObject: function (): object {
    throw new Error('Function not implemented.');
  },
  update: function (): Promise<Entry<EntrySkeletonType<IHeroFields>>> {
    throw new Error('Function not implemented.');
  },
};
