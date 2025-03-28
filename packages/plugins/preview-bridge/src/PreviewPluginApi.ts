import { ExperienceConfiguration } from '@ninetailed/experience.js';
import { AllowedVariableType, Change, JsonObject } from './types';

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

  changes?: Change[] | null;
  overriddenChanges?: Change[] | null;
  variableOverwrites: Record<string, Change>;

  setVariableValue: (args: {
    experienceId: string;
    key: string;
    value: string | JsonObject;
    variantIndex: number;
  }) => void;
  resetVariableValue: (args: { experienceId: string; key: string }) => void;
  resetAllVariableValues: () => void;

  isVariableOverridden: (
    experienceId: string,
    key: string,
    variantIndex?: number | undefined
  ) => boolean;
  getVariableValue: (
    experienceId: string,
    key: string,
    variantIndex: number
  ) => AllowedVariableType | undefined;
  getExperienceVariableOverrides: (
    experienceId: string
  ) => Record<string, Record<number, AllowedVariableType>>;
};
