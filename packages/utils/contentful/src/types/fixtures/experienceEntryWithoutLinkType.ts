export const experienceEntryWithoutLinkType = [
  {
    sys: {
      id: '4l5B7sToaNGT0pL8wNAtsP',
      contentType: {
        sys: {
          id: 'nt_experience',
          type: 'ContentType',
          revision: 1,
          createdAt: '2023-08-10T14:51:31.374Z',
          updatedAt: '2023-08-10T14:51:31.374Z',
          environment: {
            sys: {
              type: 'Link',
              id: 'QA',
              linkType: 'Environment',
            },
          },
          space: {
            sys: {
              type: 'Link',
              id: 'idkl71bhxp9d',
              linkType: 'Space',
            },
          },
        },
        name: 'Ninetailed Experience',
        description: 'Ninetailed Experience',
        displayField: 'nt_name',
        fields: [
          {
            id: 'nt_name',
            name: 'Name',
            type: 'Symbol',
            required: true,
            localized: false,
          },
          {
            id: 'nt_description',
            name: 'Description',
            type: 'Text',
            required: false,
            localized: false,
          },
          {
            id: 'nt_type',
            name: 'Type',
            type: 'Symbol',
            required: true,
            localized: false,
            disabled: true,
          },
          {
            id: 'nt_config',
            name: 'Config',
            type: 'Object',
            required: true,
            localized: false,
          },
          {
            id: 'nt_audience',
            name: 'Audience',
            type: 'Link',
            required: false,
            localized: false,
            disabled: true,
            linkType: 'Entry',
          },
          {
            id: 'nt_variants',
            name: 'Variants',
            type: 'Array',
            required: false,
            localized: false,
            disabled: true,
            items: {
              type: 'Link',
              linkType: 'Entry',
            },
          },
        ],
      },
      publishedAt: '2023-08-11T09:39:20.628000Z',
      firstPublishedAt: '2023-08-10T15:05:41.037000Z',
    },
    fields: {
      nt_name: 'OS Testing',
      nt_description: null,
      nt_type: 'nt_experiment',
      nt_config: {
        traffic: 1,
        components: [
          {
            baseline: {
              id: '50LFM6YHR9NoqPilYKEGeT',
            },
            variants: [
              {
                id: '2Q5ZkLPpEs5ZOmEttJMh42',
                hidden: false,
              },
            ],
          },
        ],
        distribution: [0.5, 0.5],
      },
      nt_audience: null,
      nt_variants: [
        {
          sys: {
            id: '2Q5ZkLPpEs5ZOmEttJMh42',
            contentType: {
              sys: {
                id: 'moduleHero',
                type: 'ContentType',
                revision: 68,
                createdAt: '2022-10-17T10:01:55.847Z',
                updatedAt: '2023-08-10T14:54:11.067Z',
                environment: {
                  sys: {
                    type: 'Link',
                    id: 'QA',
                    linkType: 'Environment',
                  },
                },
                space: {
                  sys: {
                    type: 'Link',
                    id: 'idkl71bhxp9d',
                    linkType: 'Space',
                  },
                },
              },
              name: 'Module : Hero Panel',
              description: '',
              displayField: 'internalTitle',
              fields: [
                {
                  id: 'internalTitle',
                  name: 'Internal title',
                  type: 'Symbol',
                  required: true,
                  localized: false,
                },
                {
                  id: 'component',
                  name: 'Type',
                  type: 'Symbol',
                  required: true,
                  localized: false,
                },
                {
                  id: 'images',
                  name: 'Images',
                  type: 'Object',
                  required: false,
                  localized: false,
                },
                {
                  id: 'videoId',
                  name: 'Video',
                  type: 'Link',
                  required: false,
                  localized: false,
                  linkType: 'Entry',
                },
                {
                  id: 'category',
                  name: 'Pre-title',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'title',
                  name: 'Title',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'body',
                  name: 'Summary',
                  type: 'RichText',
                  required: false,
                  localized: false,
                },
                {
                  id: 'layout',
                  name: 'Layout',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'homepageLayout',
                  name: 'Homepage Layout',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'homepageStyle',
                  name: 'Homepage Style',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'videoType',
                  name: 'Video Type',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'video',
                  name: 'Video',
                  type: 'Object',
                  required: false,
                  localized: false,
                },
                {
                  id: 'animation',
                  name: 'Animation',
                  type: 'Object',
                  required: false,
                  localized: false,
                },
                {
                  id: 'homepagePanelColour',
                  name: 'Homepage Panel Colour',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'homepagePanelOptions',
                  name: 'Homepage Panel Options',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'homepageCountdown',
                  name: 'Countdown End Date/Time',
                  type: 'Date',
                  required: false,
                  localized: false,
                },
                {
                  id: 'buttonLabel',
                  name: 'Button Label',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'buttonUrl',
                  name: 'Button URL',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'loginOptions',
                  name: 'Login options?',
                  type: 'Boolean',
                  required: false,
                  localized: false,
                },
                {
                  id: 'campaignOptions',
                  name: 'Campaign Options',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'anchor',
                  name: 'Anchor Key',
                  type: 'Symbol',
                  required: false,
                  localized: false,
                },
                {
                  id: 'nt_experiences',
                  name: 'Ninetailed',
                  type: 'Array',
                  required: false,
                  localized: false,
                  items: {
                    type: 'Link',
                    linkType: 'Entry',
                  },
                },
              ],
            },
            publishedAt: '2023-04-19T14:33:35.274000Z',
            firstPublishedAt: '2023-04-18T15:57:59.920000Z',
          },
          fields: {
            internalTitle: 'Professional - Professional Art Pass',
            component: 'Professional Art Pass',
            images: [
              {
                alt: null,
                bynder: {
                  id: 'D7C80D4A-EA34-4958-A5E98E720AAEC1CB',
                  expires: null,
                },
                srcset: {
                  lg: 'https://dnztw2jgbuerz.cloudfront.net/D7C80D4A-EA34-4958-A5E98E720AAEC1CB/e72d4ee9468dbde96be601c11d0d6f10-lg.jpg',
                  md: 'https://dnztw2jgbuerz.cloudfront.net/D7C80D4A-EA34-4958-A5E98E720AAEC1CB/e72d4ee9468dbde96be601c11d0d6f10-md.jpg',
                  xl: 'https://dnztw2jgbuerz.cloudfront.net/D7C80D4A-EA34-4958-A5E98E720AAEC1CB/e72d4ee9468dbde96be601c11d0d6f10-xl.jpg',
                  xs: 'https://dnztw2jgbuerz.cloudfront.net/D7C80D4A-EA34-4958-A5E98E720AAEC1CB/e72d4ee9468dbde96be601c11d0d6f10-xs.jpg',
                  xxs: 'https://dnztw2jgbuerz.cloudfront.net/D7C80D4A-EA34-4958-A5E98E720AAEC1CB/e72d4ee9468dbde96be601c11d0d6f10-xxs.jpg',
                },
                caption: null,
                primary: false,
                copyright: null,
              },
              {
                alt: null,
                bynder: {
                  id: 'F948EE60-5012-4C0A-B9355CF25E631BD8',
                  expires: null,
                },
                srcset: {
                  lg: 'https://dnztw2jgbuerz.cloudfront.net/F948EE60-5012-4C0A-B9355CF25E631BD8/62e7be1dda70d6be7f5449b6d0a54158-lg.jpg',
                  md: 'https://dnztw2jgbuerz.cloudfront.net/F948EE60-5012-4C0A-B9355CF25E631BD8/62e7be1dda70d6be7f5449b6d0a54158-md.jpg',
                  xl: 'https://dnztw2jgbuerz.cloudfront.net/F948EE60-5012-4C0A-B9355CF25E631BD8/62e7be1dda70d6be7f5449b6d0a54158-xl.jpg',
                  xs: 'https://dnztw2jgbuerz.cloudfront.net/F948EE60-5012-4C0A-B9355CF25E631BD8/62e7be1dda70d6be7f5449b6d0a54158-xs.jpg',
                  xxs: 'https://dnztw2jgbuerz.cloudfront.net/F948EE60-5012-4C0A-B9355CF25E631BD8/62e7be1dda70d6be7f5449b6d0a54158-xxs.jpg',
                },
                caption: null,
                primary: true,
                copyright: null,
              },
            ],
            videoId: null,
            category: null,
            title: 'Get your pass',
            body: {
              nodeType: 'document',
              content: [
                {
                  nodeType: 'paragraph',
                  content: [
                    {
                      nodeType: 'text',
                      value:
                        'A Professional Art Pass lets you enjoy free entry to hundreds of museums, galleries and historic houses across the UK as well as 50% off major exhibitions.',
                      marks: [],
                      content: [],
                    },
                  ],
                  data: [],
                },
              ],
            },
            layout: 'Image on Left',
            homepageLayout: 'Full Screen',
            homepageStyle: 'Images',
            videoType: null,
            video: null,
            animation: null,
            homepagePanelColour: 'Art Fund Pastel Pink',
            homepagePanelOptions: 'None',
            homepageCountdown: null,
            buttonLabel: 'Get your pass',
            buttonUrl: '#professional-get-your-pass',
            loginOptions: false,
            campaignOptions: null,
            anchor: 'professional-professional-art-pass',
            nt_experiences: [],
          },
          metadata: {
            tags: [],
            tagNames: [],
          },
        },
      ],
    },
    metadata: {
      tags: [],
      tagNames: [],
    },
  },
];
