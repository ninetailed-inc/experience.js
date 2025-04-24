import React from 'react';
import { setTimeout as sleep } from 'node:timers/promises';
import { act, renderHook } from '@testing-library/react';

import { Ninetailed } from '@ninetailed/experience.js';
import {
  ComponentTypeEnum,
  NinetailedApiClient,
} from '@ninetailed/experience.js-shared';

import { useExperience } from './useExperience';
import { NinetailedContext } from '../NinetailedContext';

describe('useExperience', () => {
  const mockNinetailed = () => {
    const apiClient = new NinetailedApiClient({ clientId: 'test' });

    apiClient.upsertProfile = jest.fn().mockResolvedValue({
      profile: { id: 'test' },
      experiences: [
        {
          experienceId: '2nwOWZK7NOIyuX737sFZ0A',
          variantIndex: 1,
          variants: {
            '4hXsA6l0nWtToi8eWQmJ4n': '7ubLCMbB5kVgY4FnjKCpMZ',
          },
        },
        {
          experienceId: '3VDbqTMM6fArPlzJHGyLtu',
          variantIndex: 0,
          variants: {
            '32WvgBhIZI1HLS4MvWjkvb': '32WvgBhIZI1HLS4MvWjkvb',
          },
        },
        {
          experienceId: '3m1HTWSCdvCHz3qXDaqkOm',
          variantIndex: 1,
          variants: {
            '3HQIlpV2OtnpSbs2zRwDGi': '6ytJPD38eqprLooUR0ms1q',
            '2HtPJAcLzOKMfS9pXzKlyG': 'Z51sGdeBlUIVDqpbzF90H',
            '62at4nxJ87TzPnlD3N38V2': '642elZ1sAlE0F2WloYv3Jk',
          },
        },
      ],
    });

    const ninetailed = new Ninetailed(apiClient);

    return ninetailed;
  };

  const createNinetailedContextWrapper = (ninetailed: Ninetailed) => {
    return ({ children }: React.PropsWithChildren) => {
      return (
        <NinetailedContext.Provider value={ninetailed}>
          {children}
        </NinetailedContext.Provider>
      );
    };
  };

  it('should handle when the baseline is selected as the variant', async () => {
    const ninetailed = mockNinetailed();

    const experience = {
      id: '3VDbqTMM6fArPlzJHGyLtu',
      type: 'nt_experiment' as const,
      audience: {
        id: '5A1ZvBh2chTzPnlD3N38V2',
      },
      distribution: [
        {
          index: 0,
          start: 0,
          end: 1,
        },
      ],
      trafficAllocation: 1,
      components: [
        {
          baseline: {
            id: '32WvgBhIZI1HLS4MvWjkvb',
          },
          type: ComponentTypeEnum.EntryReplacement,
          variants: [
            {
              id: '43SvtAkZ3zTzPnlD3N38V2',
            },
          ],
        },
      ],
    };

    const { result } = renderHook(
      () =>
        useExperience({
          baseline: {
            id: '32WvgBhIZI1HLS4MvWjkvb',
          },
          experiences: [
            {
              ...experience,
              components: experience.components.map((component) => ({
                ...component,
                type: ComponentTypeEnum.EntryReplacement,
              })),
            },
          ],
        }),
      {
        wrapper: createNinetailedContextWrapper(ninetailed),
      }
    );

    await sleep(5);

    await act(async () => {
      ninetailed.identify('test');
    });

    expect(result.current.status).toEqual('success');
    expect(result.current.loading).toEqual(false);
    expect(result.current.variantIndex).toEqual(0);
    expect(result.current.variant).toEqual(experience.components[0].baseline);
    expect(result.current.baseline).toEqual(experience.components[0].baseline);
    expect(result.current.hasVariants).toEqual(true);
    expect(result.current.experience).toEqual(experience);
    expect(result.current.audience).toEqual(experience.audience);
  });

  it('should handle when a variant is selected', async () => {
    const ninetailed = mockNinetailed();

    const experience = {
      id: '2nwOWZK7NOIyuX737sFZ0A',
      type: 'nt_experiment' as const,
      audience: {
        id: '5A1ZvBh2chTzPnlD3N38V2',
      },
      distribution: [
        {
          index: 0,
          start: 0,
          end: 1,
        },
      ],
      trafficAllocation: 1,
      components: [
        {
          type: ComponentTypeEnum.EntryReplacement,
          baseline: {
            id: '4hXsA6l0nWtToi8eWQmJ4n',
          },
          variants: [
            {
              id: '6vYvBh2chTzPnlD3N38V2',
            },
            {
              id: '7ubLCMbB5kVgY4FnjKCpMZ',
            },
          ],
        },
      ],
    };

    const { result } = renderHook(
      () =>
        useExperience({
          baseline: {
            id: '4hXsA6l0nWtToi8eWQmJ4n',
          },
          experiences: [
            {
              ...experience,
              components: experience.components.map((component) => ({
                ...component,
                type: ComponentTypeEnum.EntryReplacement,
              })),
            },
          ],
        }),
      {
        wrapper: createNinetailedContextWrapper(ninetailed),
      }
    );

    // not sure why CI fails without this sleep
    await sleep(8);

    await act(async () => {
      ninetailed.identify('test');
    });

    expect(result.current.status).toEqual('success');
    expect(result.current.loading).toEqual(false);
    expect(result.current.variantIndex).toEqual(1);
    expect(result.current.variant).toEqual(
      experience.components[0].variants[0]
    );
    expect(result.current.baseline).toEqual(experience.components[0].baseline);
    expect(result.current.hasVariants).toEqual(true);
    expect(result.current.experience).toEqual(experience);
    expect(result.current.audience).toEqual(experience.audience);
  });
});
