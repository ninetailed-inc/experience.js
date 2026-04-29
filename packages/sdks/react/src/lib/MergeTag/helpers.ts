import { getByPath, Profile } from '@ninetailed/experience.js-shared';

export const generateSelectors = (id: string) => {
  return id.split('_').map((path, index, paths) => {
    const dotPath = paths.slice(0, index).join('.');
    const underScorePath = paths.slice(index).join('_');

    return [dotPath, underScorePath].filter((path) => path !== '').join('.');
  });
};

export const selectValueFromProfile = (profile: Profile, id: string) => {
  const selectors = generateSelectors(id);
  // Selectors are matched by truthiness.
  // Existing falsy values (e.g. 0, false, '') are treated as unresolved.
  // It is currently unclear whether this is desired behavior or an accidental one.
  const matchingSelector = selectors.find((selector) =>
    getByPath(profile, selector)
  );

  if (!matchingSelector) {
    return null;
  }

  return getByPath(profile, matchingSelector);
};
