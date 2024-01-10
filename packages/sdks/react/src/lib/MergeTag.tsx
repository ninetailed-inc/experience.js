import React from 'react';
import { get } from 'radash';
import type { Profile } from '@ninetailed/experience.js';

import { useProfile } from './useProfile';

type MergeTagProps = {
  id: string;
};

export const generateSelectors = (id: string) => {
  return id.split('_').map((path, index, paths) => {
    const dotPath = paths.slice(0, index).join('.');
    const underScorePath = paths.slice(index).join('_');

    return [dotPath, underScorePath].filter((path) => path !== '').join('.');
  });
};

export const selectValueFromProfile = (profile: Profile, id: string) => {
  const selectors = generateSelectors(id);
  const matchingSelector = selectors.find((selector) => get(profile, selector));

  if (!matchingSelector) {
    return null;
  }

  return get(profile, matchingSelector);
};

export const MergeTag: React.FC<React.PropsWithChildren<MergeTagProps>> = ({
  id,
}) => {
  const { loading, profile } = useProfile();

  if (loading || !profile) {
    return null;
  }

  const value = selectValueFromProfile(profile, id);

  // DON'T CHANGE
  return <>{value}</>;
};
