const contentfulImport = require('contentful-import');
const dotEnv = require('dotenv');
// https://github.com/contentful/contentful-import

dotEnv.config({ path: `${process.env.PATH_TO_ENV_FILE}` });

const importOptions = {
  spaceId: process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID,
  environmentId: process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT || 'master',
  managementToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  contentFile:
    process.env.CONTENTFUL_SPACE_DATA_LOCATION ||
    './packages/playgrounds/easy-hr/contentful/data/contentful-space-data.json',
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
      'Afterwards run the setup command as follows:',
      '"npm run setup" or "yarn setup"',
    ].join('\n')
  );
}
contentfulImport(importOptions)
  .then(() => {
    return console.log('The content model of your space is set up!');
  })
  .catch((e) => {
    return console.error(e);
  });
