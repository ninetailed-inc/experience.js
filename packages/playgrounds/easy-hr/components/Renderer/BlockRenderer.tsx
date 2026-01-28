import React from 'react';
import * as Contentful from 'contentful';
import { get } from 'radash';
import { Experience } from '@ninetailed/experience.js-next';
import {
  BaselineWithExperiencesEntry,
  ExperienceMapper,
} from '@ninetailed/experience.js-utils-contentful';

import { Hero } from '@/components/Hero';
import { CTA } from '@/components/Cta';
import { Feature } from '@/components/Feature';
import { Banner } from '@/components/Banner';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PricingTable } from '@/components/PricingTable';
import { PricingPlan } from '@/components/PricingPlan';
import { Form } from '@/components/Form';
import { HubspotForm } from '@/components/HubspotForm';

import { ComponentContentTypes } from '@/lib/constants';
import { EntrySkeletonType } from 'contentful';

const ContentTypeMap = {
  [ComponentContentTypes.Hero]: Hero,
  [ComponentContentTypes.CTA]: CTA,
  [ComponentContentTypes.Feature]: Feature,
  [ComponentContentTypes.Banner]: Banner,
  [ComponentContentTypes.Navigation]: Navigation,
  [ComponentContentTypes.Footer]: Footer,
  [ComponentContentTypes.PricingPlan]: PricingPlan,
  [ComponentContentTypes.PricingTable]: PricingTable,
  [ComponentContentTypes.Form]: Form,
  [ComponentContentTypes.HubspotForm]: HubspotForm,
};

type BlockRendererProps = {
  block: BaselineWithExperiencesEntry | BaselineWithExperiencesEntry[];
};

type ComponentRendererProps = Contentful.Entry<EntrySkeletonType>;

const ComponentRenderer: React.FC<ComponentRendererProps> = (props) => {
  const contentTypeId = get(props, 'sys.contentType.sys.id') as string;
  const Component = ContentTypeMap[contentTypeId];

  if (!Component) {
    console.warn(`${contentTypeId} can not be handled`);
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return <Component {...props} />;
};

const BlockRenderer = ({ block }: BlockRendererProps) => {
  if (Array.isArray(block)) {
    return (
      <>
        {block.map((b) => {
          return <BlockRenderer key={`block-${b.sys.id}`} block={b} />;
        })}
      </>
    );
  }

  const contentTypeId = get(block, 'sys.contentType.sys.id') as string;
  const { id } = block.sys;

  const experiences = (block.fields.nt_experiences || [])
    .filter((experience) => ExperienceMapper.isExperienceEntry(experience))
    .map((experience) => ExperienceMapper.mapExperience(experience));

  return (
    <div key={`${contentTypeId}-${id}`}>
      <Experience
        {...block}
        id={id}
        component={ComponentRenderer}
        experiences={experiences}
      />
    </div>
  );
};

export { BlockRenderer };
