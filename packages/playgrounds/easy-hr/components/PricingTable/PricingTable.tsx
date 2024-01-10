import React from 'react';
import { PricingPlan } from '@/components/PricingPlan';
import { IPricingTable } from '@/types/contentful';
import { RichText } from '../RichText/RichText';

export const PricingTable: React.FC<IPricingTable> = ({ fields }) => {
  return (
    <div className="max-w-7xl mx-auto py-24 px-4 bg-white sm:px-6 lg:px-8">
      <RichText
        className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl"
        richTextDocument={fields.headline}
      />
      <RichText
        className="mt-6 text-xl text-gray-500"
        richTextDocument={fields.subline}
      />

      {/* Tiers */}
      <div className="mt-24 space-y-12 lg:space-y-0 flex flex-col lg:flex-row lg:gap-x-8">
        {fields.pricingPlans.map((plan) => {
          return (
            <div key={plan.sys.id} className="flex-1">
              <PricingPlan {...plan} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PricingTable;
