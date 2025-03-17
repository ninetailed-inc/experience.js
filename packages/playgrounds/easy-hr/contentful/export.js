const contentfulExport = require('contentful-export');
const dotEnv = require('dotenv');
// https://github.com/contentful/contentful-export

dotEnv.config({ path: `${process.env.PATH_TO_ENV_FILE}` });
/**
 * Provide the deliveryToken if you want to export
 * just the latest published versions of your content
 * */
const exportOptions = {
  spaceId: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  environmentId: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master',
  managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  contentFile:
    process.env.CONTENTFUL_SPACE_DATA_LOCATION ||
    './packages/playgrounds/easy-hr/contentful/data/contentful-space-data.json',
  includeDrafts: true,
  skipRoles: true,
  skipWebhooks: true,
};

if (
  !process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID ||
  !process.env.CONTENTFUL_MANAGEMENT_TOKEN
) {
  throw new Error(
    [
      'Parameters missing...',
      'Please insert the following credentials into your .env.local file:',
      '- NEXT_PUBLIC_CONTENTFUL_SPACE_ID=XXX',
      '- CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-XXX',
      'Afterwards run the export command as follows:',
      '"npm run export" or "yarn export"',
    ].join('\n')
  );
}

contentfulExport(exportOptions)
  .then((result) => {
    console.log('Your space data:', result);
  })
  .catch((err) => {
    console.log('Oh no! Some errors occurred!', err);
  });
