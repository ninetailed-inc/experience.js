import React from 'react';
import '@/styles/globals.css';
import { AppProps as NextAppProps } from 'next/app';
import Script from 'next/script';
import {
  ExperienceConfiguration,
  NinetailedProvider,
} from '@ninetailed/experience.js-next';
import { NinetailedPreviewPlugin } from '@ninetailed/experience.js-plugin-preview';
import { HubspotProvider } from '@aaronhayes/react-use-hubspot-form';
import { IPage } from '@/types/contentful';
import type { ExposedAudienceDefinition } from '@ninetailed/experience.js-preview-bridge';
import { NinetailedInsightsPlugin } from '@ninetailed/experience.js-plugin-insights';

type AppProps<P = unknown> = {
  pageProps: P;
} & Omit<NextAppProps<P>, 'pageProps'>;

interface CustomPageProps {
  page: IPage;
  ninetailed?: {
    experiments: ExperienceConfiguration[];
    preview: {
      experiences: ExperienceConfiguration[];
      audiences: ExposedAudienceDefinition[];
    };
  };
}

const B2BDemoApp = ({ Component, pageProps }: AppProps<CustomPageProps>) => {
  console.log({ pageProps });
  return (
    <div className="app">
      <HubspotProvider>
        <NinetailedProvider
          /* preview*/
          plugins={[
            new NinetailedPreviewPlugin({
              experiences: pageProps.ninetailed?.preview.experiences || [],
              audiences: pageProps.ninetailed?.preview.audiences || [],
              onOpenExperienceEditor: (experience) => {
                console.log({ experience });
              },
              onOpenAudienceEditor: (audience) => {
                console.log({ audience });
              },
              // url: 'http://localhost:4201/v2',
            }),
            new NinetailedInsightsPlugin(),
          ]}
          clientId={process.env.NEXT_PUBLIC_NINETAILED_CLIENT_ID ?? ''}
          environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT ?? 'main'}
        >
          {process.env.NEXT_PUBLIC_GTM_ID && (
            <Script
              id="gtm-base"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`,
              }}
            />
          )}
          <Component {...pageProps} />
        </NinetailedProvider>
      </HubspotProvider>
    </div>
  );
};

export default B2BDemoApp;
