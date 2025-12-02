export const experienceEntryWithoutVariants = {
  metadata: {
    tags: [],
  },
  sys: {
    space: {
      sys: {
        type: 'Link',
        linkType: 'Space',
        id: '0au1p5a77y87',
      },
    },
    id: '44jIanEK8sjH9SoJ5AOa7m',
    type: 'Entry',
    createdAt: '2022-07-28T12:04:38.340Z',
    updatedAt: '2022-08-09T13:08:01.879Z',
    environment: {
      sys: {
        id: 'master',
        type: 'Link',
        linkType: 'Environment',
      },
    },
    revision: 10,
    contentType: {
      sys: {
        type: 'Link',
        linkType: 'ContentType',
        id: 'nt_experience',
      },
    },
    locale: 'en-US',
  },
  fields: {
    nt_name: '[Experiment] No heroes',
    nt_type: 'nt_experiment',
    nt_experience_id: '44jIanEK8sjH9SoJ5AOa7m',
    nt_config: {
      traffic: 1,
      components: [
        {
          baseline: {
            id: '4mahmSaVUyMjv25Uk8sFZ4',
          },
          variants: [
            {
              id: '',
              hidden: true,
            },
          ],
        },
        {
          baseline: {
            id: '7yMEGUwVFS2vssCPaTBmoR',
          },
          variants: [
            {
              id: '',
              hidden: true,
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
        space: {
          sys: {
            type: 'Link',
            linkType: 'Space',
            id: '0au1p5a77y87',
          },
        },
        id: '64ducOq8OgG6N0zK3SuRnq',
        type: 'Entry',
        createdAt: '2022-07-20T12:52:40.498Z',
        updatedAt: '2022-07-20T12:52:40.498Z',
        environment: {
          sys: {
            id: 'master',
            type: 'Link',
            linkType: 'Environment',
          },
        },
        revision: 1,
        contentType: {
          sys: {
            type: 'Link',
            linkType: 'ContentType',
            id: 'nt_audience',
          },
        },
        locale: 'en-US',
      },
      fields: {
        nt_name: 'All visitors',
        nt_rules: {
          any: [
            {
              all: [
                {
                  type: 'page',
                  count: '1',
                  value: '',
                  operator: 'greaterThanInclusive',
                  conditions: [
                    {
                      key: {
                        id: 'context_page_url',
                        value: '',
                        key: 'context_page_url',
                        category: {
                          name: 'url',
                          label: 'URL',
                          type: 'string',
                        },
                        label: 'URL',
                        useOnce: true,
                      },
                      operator: 'equal',
                      value: '*',
                    },
                  ],
                },
              ],
            },
          ],
        },
        nt_audience_id: '64ducOq8OgG6N0zK3SuRnq',
      },
    },
  },
};
