import React from 'react';
import Link from 'next/link';
import { useNinetailed } from '@ninetailed/experience.js-next';

import { RichText } from '@/components/RichText';
import { IFooter } from '@/types/contentful';

export const Footer: React.FC<IFooter> = ({ fields }) => {
  const { reset } = useNinetailed();
  return (
    <footer className="bg-gray-800">
      <div className="max-w-7xl mt-16 mx-auto py-12 px-2 overflow-hidden sm:px-6 lg:px-8">
        <nav
          className="-mx-1 -my-2 flex flex-wrap justify-center"
          aria-label="Footer"
        >
          {fields.footerLinks?.map((link) => {
            if (!link) {
              return null;
            }

            if (!link.fields.slug) {
              return (
                <div key={link.sys.id} className="px-5 py-2">
                  <a
                    className="text-base text-gray-300 hover:text-white"
                    href="/"
                  >
                    {link.fields.buttonText}
                  </a>
                </div>
              );
            }

            return (
              <div key={link.sys.id} className="px-5 py-2">
                <Link legacyBehavior href={link.fields.slug}>
                  <a
                    className="text-base text-gray-300 hover:text-white"
                    href={link.fields.slug}
                  >
                    {link.fields.buttonText}
                  </a>
                </Link>
              </div>
            );
          })}
          <div className="px-5 py-2">
            <button
              type="button"
              className="text-base text-gray-300 hover:text-white cursor-pointer"
              onClick={reset}
            >
              Reset Personalization
            </button>
          </div>
        </nav>
        <RichText
          className="mt-8 text-center text-base text-gray-300"
          richTextDocument={fields.copyright}
        />
      </div>
    </footer>
  );
};
