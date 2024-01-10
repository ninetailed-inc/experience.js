const contentfulManagement = require('contentful-management');
require('dotenv').config({ path: `${process.env.PATH_TO_ENV_FILE}` });

const contentfulManagementClient = () => {
  const contentfulClient = contentfulManagement.createClient({
    accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
  });
  return contentfulClient
    .getSpace(process.env.CONTENTFUL_SPACE_ID)
    .then((space) => {
      return space.getEnvironment(process.env.CONTENTFUL_ENVIRONMENT);
    });
};
module.exports = contentfulManagementClient;
