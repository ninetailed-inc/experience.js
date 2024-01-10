import React from 'react';

type HeroProps = {
  headline: string | JSX.Element;
};

export const Hero: React.FC<React.PropsWithChildren<HeroProps>> = ({
  headline,
}) => {
  return <h1>{headline}</h1>;
};
