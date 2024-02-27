import { AppProps } from 'next/app';
import '../styles/globals.css';
import Head from 'next/head';

import { NinetailedProvider } from '@ninetailed/experience.js-next';
/*import { NinetailedProvider } from '../../../../dist/packages/sdks/nextjs/index.cjs';*/

/*import { NinetailedGoogleAnalyticsPlugin } from '@ninetailed/experience.js-plugin-google-analytics';*/
/*import { NinetailedGoogleAnalyticsPlugin } from '../../../../dist/packages/plugins/google-analytics/index.cjs';*/

import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-plugin-preview';
/*import { NinetailedPreviewPlugin } from '../../../../dist/packages/plugins/preview/index.js';*/
/*import { NinetailedPreviewPlugin } from '../../../plugins/preview/src/index';*/

/*import { NinetailedSegmentPlugin } from '@ninetailed/experience.js-plugin-segment';*/
/*import { NinetailedSegmentPlugin } from '../../../../dist/packages/plugins/segment';*/

/*import { NinetailedContentsquarePlugin } from '@ninetailed/experience.js-plugin-contentsquare';*/
/*import { NinetailedContentsquarePlugin } from '../../../../dist/packages/plugins/contentsquare';*/

// import { NinetailedPrivacyPlugin } from '@ninetailed/experience.js-plugin-privacy';
//import { NinetailedPrivacyPlugin } from '../../../../dist/packages/plugins/privacy';

/*import NinetailedGoogleTagmanagerPlugin from '@ninetailed/experience.js-plugin-google-tagmanager';*/
/*import NinetailedGoogleTagmanagerPlugin from '../../../../dist/packages/plugins/google-tagmanager/src/index.js';*/

import { NinetailedSsrPlugin } from '@ninetailed/experience.js-plugin-ssr';

import { ExperienceMapper } from '@ninetailed/experience.js-utils-contentful';
// eslint-disable-next-line @nx/enforce-module-boundaries
import productWithExperiment from '../../fixtures/contentful/product-with-experiment.json';

function CustomApp({ Component, pageProps }: AppProps) {
  const experiences = productWithExperiment.fields.nt_experiences.map(
    (ctfExperience) => {
      const mapped = ExperienceMapper.mapCustomExperience(
        ctfExperience,
        (variant) => ({ id: variant.sys.id, ...variant.fields })
      );

      return mapped;
    }
  );

  return (
    <NinetailedProvider
      /**
       * This is the production setup
       */
      clientId={process.env.NEXT_PUBLIC_NINETAILED_CLIENT_ID || ''}
      environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT}
      plugins={[
        new NinetailedPreviewPlugin({
          experiences: pageProps.ninetailed?.preview.allExperiences,
          audiences: pageProps.ninetailed?.preview.allAudiences,
          // ui: { opener: { hide: false } },
        }),
        // new NinetailedPrivacyPlugin({}),
        /* NinetailedGoogleAnalyticsPlugin({ trackingId: 'UA-11' }),*/
        /*new NinetailedSegmentPlugin({
          audiencePropertyTemplate: "{{audience.name || 'baseline'}}",
        }),*/
        /* NinetailedContentsquarePlugin(),*/
        /* NinetailedPrivacyPlugin({
          allowedEvents: ['page', 'identify'],
          allowedTraits: ['nt_experiment*'],
          blockProfileMerging: true,
        }),*/
        /* NinetailedGoogleTagmanagerPlugin(),*/
        new NinetailedSsrPlugin(),
      ]}
      onError={() => {
        console.log('caught error');
      }}
    >
      <Head>
        <title>Welcome to next-js!</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </NinetailedProvider>
  );
}

export default CustomApp;
