import { Profile } from '@ninetailed/experience.js-shared';
import { get } from 'radash';

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
