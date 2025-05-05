export const decodeExperienceVariantsMap = (
  encodedExperienceVariantsMap: string
): Record<string, number> => {
  const experientVariantsAssignments = encodedExperienceVariantsMap.split(',');
  const experienceVariantsMap: Record<string, number> = {};

  for (const experienceVariantAssignment of experientVariantsAssignments) {
    const [experienceId, variantIndexString] =
      experienceVariantAssignment.split('=');
    const variantIndex = parseInt(variantIndexString);

    if (!experienceId || !variantIndex) {
      continue;
    }

    experienceVariantsMap[experienceId] = variantIndex;
  }

  return experienceVariantsMap;
};
