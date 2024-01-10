const path = require("path")

const audienceQuery = `
    query NinetailedAudienceQuery {
      allContentfulNinetailedAudience {
        edges {
          node {
            nt_audience_id
            nt_name
            nt_description {
              nt_description
            }
          }
        }
      }
    }
  `

const audienceMapper = audienceData => {
  return audienceData.allContentfulNinetailedAudience.edges.map(audience => {
    return {
      id: audience.node.nt_audience_id,
      name: audience.node.nt_name,
      description: audience.node.nt_description?.nt_description,
    }
  })
}

const experienceQuery = `
    query NinetailedExperienceQuery {
      allContentfulNinetailedExperience {
        edges {
          node {
            contentful_id
            nt_audience {
              nt_audience_id
              nt_description {
                nt_description
              }
              nt_name
            }
            nt_config {
              distribution
              traffic
              components {
                baseline {
                  id
                }
                variants {
                  hidden
                  id
                }
              }
            }
            nt_description {
              nt_description
            }
            nt_name
            nt_type
          }
        }
      }
    }
  `

const experienceMapper = experienceData => {
  return experienceData.allContentfulNinetailedExperience.edges.map(
    experience => {
      return {
        audience: {
          id: experience.node.nt_audience?.nt_audience_id,
          name: experience.node.nt_audience?.nt_name,
          description:
            experience.node.nt_audience?.nt_description?.nt_description,
        },
        components: experience.node.nt_config?.components,
        description: experience.node.nt_description?.nt_description,
        distribution: experience.node.nt_config?.distribution.map(
          (percentage, index) => ({
            index,
            start: experience.node.nt_config?.distribution
              .slice(0, index)
              .reduce((a, b) => a + b, 0),
            end: experience.node.nt_config?.distribution
              .slice(0, index + 1)
              .reduce((a, b) => a + b, 0),
          })
        ),
        id: experience.node.contentful_id,
        name: experience.node.nt_name,
        traffic: experience.node.nt_config?.traffic,
        type: experience.node.nt_type,
      }
    }
  )
}

module.exports = {
  siteMetadata: {
    title: `gatsby`,
    description: `This is a gatsby application created by Nx.`,
  },
  plugins: [
    {
      resolve: "gatsby-plugin-svgr",
      options: {
        svgo: false,
        ref: true,
      },
    },
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-plugin-image`,
    `gatsby-transformer-sharp`,
    {
      resolve: require.resolve(`@nrwl/gatsby/plugins/nx-gatsby-ext-plugin`),
      options: {
        path: __dirname,
      },
    },
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/logo.svg`,
      },
    },
    {
      resolve: "gatsby-plugin-root-import",
      options: {
        "@ninetailed/experience.js-gatsby": path.join(
          __dirname,
          "../../../packages/sdks/gatsby"
        ),
      },
    },
    {
      resolve: `gatsby-source-contentful`,
      options: {
        spaceId: process.env.CONTENTFUL_SPACE_ID,
        environment: process.env.CONTENTFUL_ENVIRONMENT,
        accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
        /* host: `preview.contentful.com`,*/
      },
    },
    {
      resolve: require.resolve(
        path.join(__dirname, `../../../dist/packages/sdks/gatsby`)
      ),
      options: {
        clientId: process.env.NINETAILED_CLIENT_ID,
        environment: process.env.NINETAILED_ENVIRONMENT,
        ninetailedPlugins: [
          {
            resolve: require.resolve(
              path.join(
                __dirname,
                `../../../packages/plugins/insights/src/index.ts`
              )
            ),
            name: "@ninetailed/experience.js-plugin-insights",
          },
          {
            /* resolve: "@ninetailed/experience.js-plugin-preview",*/
            resolve: require.resolve(
              path.join(
                __dirname,
                `../../../packages/plugins/preview/src/index.ts`
              )
            ),
            name: "@ninetailed/experience.js-plugin-preview",
            options: {
              onOpenExperienceEditor: experience => {
                console.log({ experience })
              },
              onOpenAudienceEditor: audience => {
                console.log({ audience })
              },
              //url: "http://localhost:4201/v2",
              customOptions: {
                audienceQuery,
                audienceMapper,
                experienceQuery,
                experienceMapper,
              },
            },
          },
        ],
      },
    },
  ],
}
