import { z } from 'zod';
import { EntryReplacement, InlineVariable } from './BaselineWithVariants';
import { Distribution } from './Distribution';
import { Reference } from './Reference';

export type ExperienceType = 'nt_personalization' | 'nt_experiment';
export const ExperienceType = z.enum(['nt_personalization', 'nt_experiment']);

export type ExperienceConfiguration<Variant extends Reference = Reference> = {
  id: string;
  type: ExperienceType;
  name?: string;
  description?: string;
  audience?: {
    id: string;
    name?: string;
    description?: string;
  };
  trafficAllocation: number;
  distribution: Distribution[];
  sticky?: boolean;

  components: (EntryReplacement<Variant> | InlineVariable)[];
};
