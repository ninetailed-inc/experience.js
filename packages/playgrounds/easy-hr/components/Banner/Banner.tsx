import React from 'react';
import Link from 'next/link';
import { XIcon } from '@heroicons/react/solid';

import { RichText } from '@/components/RichText';
import { IBanner } from '@/types/contentful';

export type Handler = () => void;

export const Banner: React.FC<IBanner> = ({ fields }) => {
  const [show, setShow] = React.useState<boolean>(true);

  const handleCloseBanner: Handler = () => {
    setShow(!show);
  };

  return (
    <div className={show ? 'relative bg-indigo-600' : 'hidden'}>
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="pr-16 sm:text-center sm:px-16">
          <div className="font-medium text-white">
            <RichText className="inline" richTextDocument={fields.text} />
            {fields.slug && fields.linkText && (
              <>
                <span className="block sm:ml-2 sm:inline-block">
                  <Link
                    className="text-white font-bold underline"
                    href={fields.slug}
                  >
                    {fields.linkText}
                  </Link>
                </span>
                <span aria-hidden="true"> &rarr;</span>
              </>
            )}
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 pt-1 pr-1 flex items-start sm:pt-1 sm:pr-2 sm:items-start">
          <button
            type="button"
            className="flex p-2 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
          >
            <span className="sr-only">Dismiss</span>
            <XIcon
              className="h-6 w-6 text-white"
              aria-hidden="true"
              onClick={handleCloseBanner}
            />
          </button>
        </div>
      </div>
    </div>
  );
};
