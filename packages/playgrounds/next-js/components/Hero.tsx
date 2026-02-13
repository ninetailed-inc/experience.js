import React from 'react';

type HeroProps = {
  headline: string | React.ReactElement;
};

export const Hero: React.FC<React.PropsWithChildren<HeroProps>> = ({
  headline,
}) => {
  return <h1>{headline}</h1>;
};
