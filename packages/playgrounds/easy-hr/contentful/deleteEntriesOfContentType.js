const contentfulManagement = require('contentful-management');

require('dotenv').config({
  path: `${process.env.PATH_TO_ENV_FILE}`,
});

const contentfulClient = contentfulManagement.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN,
});

async function unpublishAndDeleteEntry(entry) {
  try {
    if (entry.isPublished()) {
      console.info(`Deleting published entry with id: ${entry.sys.id}`);
      await entry.unpublish().then((e) => {
        return e.delete();
      });
    } else {
      console.info(`Deleting unpublished entry with id: ${entry.sys.id}`);
      await entry.delete();
    }
  } catch (e) {
    console.log(e);
  } finally {
    console.info(`Deleted entry: ${entry.sys.id}`);
  }
}

contentfulClient
  .getSpace(process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID)
  .then((space) => {
    space
      .getEnvironment(process.env.NEXT_PUBLIC_CONTENTFUL_ENVIRONMENT)
      .then((environment) => {
        console.info(`Accessing Environment: ${environment.sys.id}`);
        console.info(
          `Deleting Entries Of ContentType: ${process.env.CONTENT_TYPE} `
        );
        environment
          .getEntries({
            content_type: `${process.env.CONTENT_TYPE}`,
            limit: `${process.env.LIMIT}`,
          })
          .then(async (response) => {
            await Promise.all(response.items.map(unpublishAndDeleteEntry));
          });
      });
  });
