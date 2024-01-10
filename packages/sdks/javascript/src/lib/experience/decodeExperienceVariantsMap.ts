export const decodeExperienceVariantsMap = (
  encodedExperienceVariantsMap: string
): Record<string, number> => {
  return encodedExperienceVariantsMap
    .split(',')
    .map((experienceIdWithVariant) => {
      const [experienceId, _variantIndex] = experienceIdWithVariant.split('=');

      const variantIndex = parseInt(_variantIndex);

      if (!experienceId || !variantIndex) {
        return null;
      }

      return { experienceId, variantIndex };
    })
    .filter((x): x is { experienceId: string; variantIndex: number } => !!x)
    .reduce(
      (acc, curr) => ({ ...acc, [curr.experienceId]: curr.variantIndex }),
      {}
    );
};
