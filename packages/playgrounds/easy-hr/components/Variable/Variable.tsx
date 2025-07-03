import { useFlag } from '@ninetailed/experience.js-react';
import React from 'react';

export const Variable: React.FC = () => {
  const shouldAutoTrack = () => {
    // we can use this to conditionally track the variable
    // e.g. based on user state, feature flags, etc.
    return true;
  };
  const { value, status } = useFlag<{
    padding: string;
    color: string;
  }>(
    'testing-component-tracking',
    {
      padding: '10px',
      color: 'blue',
    },
    {
      shouldAutoTrack,
    }
  );

  // If still loading, return fallback
  if (status === 'loading') return <>{'fallback'}</>;

  // Otherwise, render the value directly
  return (
    <>
      <h1
        style={{
          padding: value.padding,
          color: value.color,
        }}
      >
        Variable Component
      </h1>
    </>
  );
};
