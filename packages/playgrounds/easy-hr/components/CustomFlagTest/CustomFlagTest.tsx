import { useFlag } from '@ninetailed/experience.js-react';
import React, { useEffect } from 'react';

export const CustomFlagTest = () => {
  const flag1Result = useFlag('checkout-fail', 'default value');
  const flag2Result = useFlag('checkout-sucesss', 'false');

  useEffect(() => {
    console.log('CustomFlagTest rendered with flags:', {
      'checkout-fail': flag1Result.value,
      'checkout-sucess': flag2Result.value,
      status1: flag1Result.status,
      status2: flag2Result.status,
    });
  }, [
    flag1Result.value,
    flag2Result.value,
    flag1Result.status,
    flag2Result.status,
  ]);

  return (
    <div>
      <h3>CustomFlagTest</h3>
      <div>
        <strong>Flag 1 (checkout-fail):</strong>{' '}
        <span style={{ color: flag1Result.value }}>{flag1Result.value}</span>
        <span> (Status: {flag1Result.status})</span>
      </div>
      <div>
        <strong>Flag 2 (checkout-sucess):</strong>{' '}
        <span style={{ color: flag2Result.value }}>
          {String(flag2Result.value)}
        </span>
        <span> (Status: {flag2Result.status})</span>
      </div>
    </div>
  );
};
