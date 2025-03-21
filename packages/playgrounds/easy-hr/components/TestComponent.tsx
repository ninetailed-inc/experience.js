import { useFlag } from '@ninetailed/experience.js-react';

export default function TestComponent({ flagKey }: { flagKey: string }) {
  const { value, error, status } = useFlag(flagKey, 'default');

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'error') {
    return <div>Error: {error.message}</div>;
  }

  if (value === 'default') {
    return <div>Default</div>;
  }

  return (
    <>
      {value === 'blue' || value === 'purple ' ? (
        <div>true</div>
      ) : (
        <div>false</div>
      )}
    </>
  );
}
