import { ExperienceConfiguration } from '@ninetailed/experience.js';

export type ExposedAudienceDefinition = {
  id: string;
  name: string;
  description?: string;
};

export type PreviewPluginApi = {
  version: string;

  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;

  activateAudience: (id: string) => void;
  deactivateAudience: (id: string) => void;
  resetAudience: (id: string) => void;

  apiAudiences: string[];
  audienceOverwrites: Record<string, boolean>;
  activeAudiences: string[];
  audienceDefinitions: ExposedAudienceDefinition[];

  apiExperienceVariantIndexes: Record<string, number>;
  experienceVariantIndexes: Record<string, number>;
  experienceVariantIndexOverwrites: Record<string, number>;
  setExperienceVariant: (args: {
    experienceId: string;
    variantIndex: number;
  }) => void;
  resetExperience: (experienceId: string) => void;

  reset: () => void;

  experiences: ExperienceConfiguration[];

  openExperienceEditor?: (experience: ExperienceConfiguration) => void;
  openExperienceAnalytics: (experience: ExperienceConfiguration) => void;
  openAudienceEditor?: (audienceDefinition: ExposedAudienceDefinition) => void;
};
