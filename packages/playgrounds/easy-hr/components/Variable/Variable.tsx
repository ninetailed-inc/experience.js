import React from 'react';
import { useFlagWithManualTracking } from '@ninetailed/experience.js-react';

export const Variable: React.FC = () => {
  const [flag, track] = useFlagWithManualTracking<{
    padding: string;
    color: string;
  }>('testing-component-tracking', {
    padding: '10px',
    color: 'blue',
  });

  if (flag.status === 'loading') return <>Loading fallback…</>;

  const handleClick = () => {
    // This is when the user is actually "affected" by the flag
    track();
    alert('User saw and interacted with the variable component');
  };

  return (
    <div>
      <h1
        style={{
          padding: flag.value.padding,
          color: flag.value.color,
        }}
      >
        Variable Component
      </h1>

      <button onClick={handleClick}>Acknowledge Variant</button>
    </div>
  );
};
