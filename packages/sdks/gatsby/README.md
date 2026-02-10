# @ninetailed/experience.js-gatsby

<!--Insert badges begin-->
<!--GENERATED TEXT - DO NOT EDIT HERE -->
<p align="center">
<a href="https://www.npmjs.com/package/@ninetailed/experience.js-gatsby"><img src="https://img.shields.io/npm/v/@ninetailed/experience.js-gatsby.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/package/@ninetailed/experience.js-gatsby"><img src="https://img.shields.io/npm/l/@ninetailed/experience.js-gatsby.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/package/@ninetailed/experience.js-gatsby"><img src="https://img.shields.io/npm/dm/@ninetailed/experience.js-gatsby.svg" alt="NPM Downloads" /></a>
<a href="https://docs.ninetailed.io/" target="_blank"><img src="https://img.shields.io/badge/%F0%9F%93%96-Documentation-green.svg" alt="Documentation"/></a>
<a href="ninetailed-community.slack.com" target="_blank"><img src="https://img.shields.io/badge/Slack-Ninetailed%20Community-blue.svg" alt="Join the official Slack community"/>
</p>

<!--Insert badges end-->

> [!WARNING]
> Gatsby plugin is now deprecated.
> If you need Gatsby support, please open an issue in the [new Optimization SDK suite](https://github.com/contentful/optimization) or consider forking/creating your own community version.

## Introduction

Add dynamic content personalization to Gatbsy without performance trade-offs or complex integrations.

`@ninetailed/experience.js-gatsby` is a React component specially designed to work seamlessly with
Gatsby and Ninetailed.

**[Demo](https://demo.ninetailed.io/saas)**

## Table of Contents

- [Ninetailed Platform](#ninetailed-platform)
- [Install](#install)
  - [Gatsby](#gatsby)
  - [Gatsby and Contentful](#gatsby-and-contentful)
- [How to use](#how-to-use)
- [Personalizing Components](#personalizing-components)
  - [Personalize Component](#personalize-component)
  - [Inline Personalization](#inline-personalization)
- [Contentful Richtext](#contentful-richtext)
- [Additional Documentation](#additional-documentation)

## Ninetailed Platform

Ninetailed is an api-first optimization platform designed for the modern web. It is a headless personalization solution for frameworks like React or Gatsby JS and headless CMS like Contentful. The **[Ninetailed](https://ninetailed.io/)** platform includes:

- Real-time personalization API and customer data hub (CDP).
- Plugins and SDKs for easy integration with major frameworks like Gatsby.
- CMS integrations to enable content creators easily create personalized content and define audiences.
- Integration with analytics tools like Google Analytics and Mixpanel.
- Optional edge side rendering for maximum web performance.

## Install

### Gatsby

`npm install @ninetailed/experience.js-gatsby`

Install the `@ninetailed/experience.js-gatsby` modules via npm or yarn.

**Install module via npm**

```shell
npm install @ninetailed/experience.js-gatsby
```

**Install module via yarn**

```shell
yarn add @ninetailed/experience.js-gatsby
```

## How to use

Add the plugin to the plugins array in your gatsby-config.js and your API Key.

```js
plugins: [
    ...your other gatsby plugins
    {
        resolve: `@ninetailed/experience.js-gatsby`,
        options: {
            clientId: 'your api key'
        }
    }
]
```

> Your API Key can be found in the Contentful app configuration.

By using the gatsby plugin there's no need to configure the `NinetailedProvuder` as described in the React tutorial, as this is done by the plugin.

The plugin automatically tracks Pageviews on route change, please do not track it on your own as you would duplicate events.

### Ninetailed Plugins

To use Ninetailed Plugins like `@ninetailed/experience.js-plugin-preview` you have to pass them to the plugins array of the `@ninetailed/experience.js-gatsby` SDK.

```js
plugins: [
    ...your other gatsby plugins
    {
        resolve: `@ninetailed/experience.js-gatsby`,
        options: {
            clientId: 'your api key',
            ninetailedPlugins: [
              {
                resolve: `@ninetailed/experience.js-plugin-preview`,
                // These options are the args of the plugin itself
                options: {
                  clientId: "a readlony api token id",
                  secret: "a readlony token secret"
                }
              }
            ]
        }
    }
]
```

## Personalizing Components

### Personalize Component

To make personalizing your components as seamless as possible Ninetailed provides a `<Personalize />` component which wraps the component you'd like to personalize. It automatically detects the properties needed from the wrapped component and also applies a `variants` property.

```TypeScript
import React from 'react';
import { Personalize } from '@ninetailed/experience.js-react';

type HeadlineProps = {
  text: string;
}

const Headline: React.FC<HeadlineProps> = ({ text }) => {
  return <h1>{text}</h1>
};

export const Page = () => {
  // These variants normally come from your CMS
  // You can use our Contentful App for this
  const variants = [
    {
      text: "We build super nice websites for enterprise companies!",
      audience: "enterprise-audience-id" // variants have a audience id
    }
  ]

  return (<Personalize
    component={Headline}
    variants={variants}
    text="We build websites for everbody" // this is the baseline for user which are not in a audience.
  />);
};
```

### Inline Personalization

Using the visitor's and the useProfile hook makes it very easy to use inline personalization. For advanced cases like contentful Richtext we also provide a SDK - simply have a look at the gatsby section.

```TypeScript
import React, { useState, useEffect } from 'react';
import { useProfile } from '@ninetailed/experience.js-react';

const Greeting = () => {
  const [loading, profile, error] = useProfile();

  if (loading) {
    return <h2>Hey              👋, how is your day?</h2>
  }

  return <h2>Hey {profile.traits.firstname}👋, how is your day?</h2>
};
```

## Richtext

The Ninetailed Contentful App gives your content creators the option to use inline personalization in richtext fields. This is done by adding embeded entries into the text. To make the personalization working on the developer end the `@ninetailed/experience.js-gatsby` SDK provides functions which render the personalized entry.

```TypeScript
import React from 'react';
import {
  renderRichText,
  RenderRichTextData,
  ContentfulRichTextGatsbyReference,
} from 'gatsby-source-contentful/rich-text';
import { MergeTag } from '@ninetailed/experience.js-react';

const options = {
  renderNode: {
    [INLINES.EMBEDDED_ENTRY]: (node) => {
      const id = node.data.target.id;
      // The __typename changes depending on your Contentful setup.
      if (node.data.target.__typename === "ContentfulNtMergeTag" && id) {
        return <MergeTag id={mergeTag.id} />;
      }
      return <>{`${node.nodeType} ${id}`}</>;
    }
  },
};

type HeadlineProps = {
  text: RenderRichTextData<ContentfulRichTextGatsbyReference>;
};

const Headline: React.FC<HeadlineProps> = ({ text }) => {
  return <h1>{renderRichText(text, options)}</h1>
}
```

## Additional Documentation

**[Documentation](https://docs.ninetailed.io/)**
