import {
  ExperienceConfiguration,
  useExperience,
  useFlag,
} from '@ninetailed/experience.js-react';
import React, { useEffect } from 'react';

export const CustomFlagTest = () => {
  // Configure the experience that matches the one in your Ninetailed system
  const baseline = { id: 'baseline-component-id' };
  const experiences: ExperienceConfiguration[] = [
    {
      id: 'G2Wj1h033PKZDO1INBPNJ', // Make sure this ID is correct
      type: 'nt_personalization',
      audience: { id: 'sdk-test-audience' },
      // Include other required fields as per your configuration
      trafficAllocation: 100,
      distribution: [{ index: 0, start: 0, end: 100 }],
      components: [
        {
          baseline: { id: 'baseline-component-id' },
          variants: [
            { id: '74PjP6eFEOxD66R88LrL76' },
            { id: '2ow3EkPI5jKevWoTT2BVG8' },
          ],
        },
      ],
    },
  ];

  // Track the current experience state
  const experienceState = useExperience({
    baseline,
    experiences,
  });

  // Connect the flags to the current experience variant
  const flag1Result = useFlag('candy-lover', 'default value', {
    experienceId: experienceState.experience?.id,
    variantIndex: experienceState.variantIndex,
  });

  const flag2Result = useFlag('chocolate-lover', 'false', {
    experienceId: experienceState.experience?.id,
    variantIndex: experienceState.variantIndex,
  });

  // Log for debugging
  useEffect(() => {
    // console.log('CustomFlagTest updated:', {
    //   flags: {
    //     'checkout-yay': flag1Result.value,
    //     'checkout-nay': flag2Result.value,
    //   },
    //   experienceState: {
    //     id: experienceState.experience?.id,
    //     variantIndex: experienceState.variantIndex,
    //     status: experienceState.status,
    //     isPersonalized: experienceState.isPersonalized,
    //   },
    // });
  }, [
    flag1Result.value,
    flag2Result.value,
    experienceState.experience?.id,
    experienceState.variantIndex,
    experienceState.status,
    experienceState.isPersonalized,
  ]);

  return (
    <div>
      <h3>CustomFlagTest</h3>
      <div>
        <strong>Flag 1 (checkout-yay):</strong>{' '}
        <span style={{ color: flag1Result.value }}>{flag1Result.value}</span>
        <span> (Status: {flag1Result.status})</span>
      </div>
      <div>
        <strong>Flag 2 (checkout-nay):</strong>{' '}
        <span style={{ color: flag2Result.value }}>
          {String(flag2Result.value)}
        </span>
        <span> (Status: {flag2Result.status})</span>
      </div>

      {/* Debug information */}
      <div style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
        <div>Experience: {experienceState.experience?.id || 'none'}</div>
        <div>Variant: {experienceState.variantIndex}</div>
        <div>Status: {experienceState.status}</div>
      </div>
    </div>
  );
};
