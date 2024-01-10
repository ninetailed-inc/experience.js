import React from 'react';
import { Document } from '@contentful/rich-text-types';
import {
  isRichText,
  renderRichText,
  RenderRichTextOptions,
} from '@/lib/rich-text';

export interface RichTextProps {
  richTextDocument: Document | undefined;
  classNames?: RenderRichTextOptions['classNames'];
  renderNode?: RenderRichTextOptions['renderNode'];
  className?: string;
}

export const RichText: React.FC<RichTextProps> = ({
  richTextDocument,
  classNames,
  renderNode,
  ...rest
}) => {
  if (isRichText(richTextDocument)) {
    const component = renderRichText(richTextDocument, {
      classNames,
      renderNode,
    });
    return (
      <>
        {React.Children.map(component, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, rest);
          }
          return null;
        })}
      </>
    );
  }
  return null;
};

RichText.defaultProps = {
  classNames: {},
  renderNode: {},
  className: '',
};
