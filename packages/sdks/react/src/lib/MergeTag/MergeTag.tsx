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

  const value = selectValueFromProfile(profile, id) || fallback;

  return value ? <>{value}</> : null;
};
