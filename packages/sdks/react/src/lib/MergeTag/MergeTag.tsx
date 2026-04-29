import { PropsWithChildren } from 'react';
import { useProfile } from '../useProfile';
import { selectValueFromProfile } from './helpers';

type MergeTagProps = {
  id: string;
  fallback?: string;
};

export const MergeTag = ({
  id,
  fallback,
}: PropsWithChildren<MergeTagProps>) => {
  const { profile, loading } = useProfile();

  if (loading || !profile) {
    return null;
  }

  // Uses truthy fallback behavior: falsy resolved values (e.g. 0, false, '')
  // are treated the same as unresolved values and will trigger the fallback if provided.
  const value = selectValueFromProfile(profile, id) || fallback;

  return value ? <>{value}</> : null;
};
