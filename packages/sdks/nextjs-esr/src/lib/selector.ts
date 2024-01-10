import { Profile } from '@ninetailed/experience.js-shared';

type SelectNinetailedProfileOptions = {
  ninetailed: string;
};
export const selectNinetailedProfile = ({
  ninetailed,
}: SelectNinetailedProfileOptions) => {
  if (!ninetailed) {
    return null;
  }

  try {
    const data = JSON.parse(ninetailed);
    return data.profile as Profile;
  } catch {
    return null;
  }
};
