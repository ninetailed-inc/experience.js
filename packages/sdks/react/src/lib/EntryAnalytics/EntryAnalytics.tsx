import { Baseline } from '@ninetailed/experience.js';
import { Experience, ExperienceProps } from '../Experience';

export type EntryAnalyticsProps<P> = Omit<ExperienceProps<P>, 'experiences'> &
  Baseline<P>;

export const EntryAnalytics = <P,>({
  component: Component,
  passthroughProps,
  ...entry
}: EntryAnalyticsProps<P>) => {
  return (
    <Experience
      {...passthroughProps}
      {...entry}
      id={entry.id}
      component={Component}
      experiences={[]}
    />
  );
};
