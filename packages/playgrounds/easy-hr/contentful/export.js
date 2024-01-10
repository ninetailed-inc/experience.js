const contentfulExport = require('contentful-export');
const dotEnv = require('dotenv');
// https://github.com/contentful/contentful-export

dotEnv.config({ path: `${process.env.PATH_TO_ENV_FILE}` });
/**
 * Provide the deliveryToken if you want to export
 * just the latest published versions of your content
 * */
const exportOptions = {
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT,
  managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  /* deliveryToken: process.env.CONTENTFUL_TOKEN, */
  contentFile: process.env.CONTENTFUL_SPACE_DATA_LOCATION,
  includeDrafts: true,
};

if (
  !process.env.CONTENTFUL_SPACE_ID ||
  !process.env.CONTENTFUL_MANAGEMENT_TOKEN ||
  !process.env.CONTENTFUL_SPACE_DATA_LOCATION
) {
  throw new Error(
    [
      'Parameters missing...',
      'Please insert the following credentials into your .env.local.local file:',
      '- CONTENTFUL_SPACE_ID=XXX',
      '- CONTENTFUL_MANAGEMENT_TOKEN=CFPAT-XXX',
      '- CONTENTFUL_SPACE_DATA_LOCATION="PATH TO STORAGE DIRECTORY"',
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
