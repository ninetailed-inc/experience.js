import { useFlag } from '@ninetailed/experience.js-react';
import React from 'react';

export const Variable: React.FC = () => {
  const { value, status } = useFlag('preview', 'default');

  // If still loading, return fallback
  if (status === 'loading') return <>{'fallback'}</>;

  // Otherwise, render the value directly
  return <>{JSON.stringify(value)}</>;
};
