import { Reference } from '@ninetailed/experience.js';
import { z } from 'zod';

import { ExperienceSchema } from './Experience';

export const ExperimentSchema = ExperienceSchema.extend({
  type: z.string().regex(/^nt_experiment$/g),
});

type ExperimentInput = z.input<typeof ExperimentSchema>;
export type ExperimentLike<Variant extends Reference = Reference> = Omit<
  ExperimentInput,
  'variants'
> & {
  variants: Variant[];
};

type ExperimentOutput = z.infer<typeof ExperienceSchema>;
export type Experiment<Variant extends Reference = Reference> = Omit<
  ExperimentOutput,
  'variants'
> & {
  variants: Variant[];
};

const parse = <T extends Reference>(
  input: ExperimentLike<T>
): Experiment<T> => {
  const output = ExperimentSchema.parse(input);

  return {
    ...output,
    variants: input.variants,
  };
};

const safeParse = <T extends Reference>(input: ExperimentLike<T>) => {
  const output = ExperimentSchema.safeParse(input);

  if (!output.success) {
    return output;
  }

  return {
    ...output,
    data: {
      ...output.data,
      variants: input.variants,
    },
  };
};

export const Experiment = {
  ...ExperimentSchema,
  parse,
  safeParse,
};
