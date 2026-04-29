import { act, renderHook } from '@testing-library/react';
import { ChangeTypes } from '@ninetailed/experience.js-shared';
import { useProfile } from './useProfile';
import { useNinetailed } from './useNinetailed';

jest.mock('./useNinetailed');

describe('useProfile', () => {
  type ProfileStateShape = {
    status: 'loading' | 'success' | 'error';
    profile: Record<string, unknown> | null;
    experiences: unknown[];
    changes?: unknown[];
  };

  type OnProfileChangeCallback = (profileState: ProfileStateShape) => void;

  const setup = () => {
    let onProfileChangeCallback: OnProfileChangeCallback | null = null;
    const unsubscribe = jest.fn();

    const onProfileChange = jest.fn((callback: OnProfileChangeCallback) => {
      onProfileChangeCallback = callback;
      return unsubscribe;
    });

    (useNinetailed as jest.Mock).mockReturnValue({
      profileState: {
        status: 'loading',
        profile: null,
        experiences: [],
      },
      onProfileChange,
    });

    return {
      emitProfileChange: (profileState: ProfileStateShape) => {
        if (!onProfileChangeCallback) {
          throw new Error('onProfileChange callback was not registered');
        }

        onProfileChangeCallback(profileState);
      },
      onProfileChange,
      unsubscribe,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should remove experiences and expose loading state', () => {
    setup();

    const { result } = renderHook(() => useProfile());

    expect(result.current).toEqual({
      status: 'loading',
      profile: null,
      loading: true,
    });
    expect('experiences' in result.current).toBe(false);
  });

  it('should ignore duplicate profile updates with equal content', () => {
    const { emitProfileChange } = setup();

    const { result } = renderHook(() => useProfile());

    const state = {
      status: 'success' as const,
      profile: {
        id: 'profile-1',
        traits: { plan: 'pro' },
      },
      experiences: [{ id: 'exp-1' }],
    };

    act(() => {
      emitProfileChange(state);
    });

    expect(result.current).toEqual({
      status: 'success',
      profile: {
        id: 'profile-1',
        traits: { plan: 'pro' },
      },
      loading: false,
    });

    act(() => {
      emitProfileChange({
        status: 'success',
        profile: {
          id: 'profile-1',
          traits: { plan: 'pro' },
        },
        experiences: [{ id: 'exp-1' }],
      });
    });

    expect(result.current).toEqual({
      status: 'success',
      profile: {
        id: 'profile-1',
        traits: { plan: 'pro' },
      },
      loading: false,
    });
  });

  it('should process non-duplicate profile updates', () => {
    const { emitProfileChange } = setup();

    const { result } = renderHook(() => useProfile());

    act(() => {
      emitProfileChange({
        status: 'success',
        profile: {
          id: 'profile-1',
          traits: { plan: 'pro' },
        },
        experiences: [{ id: 'exp-1' }],
      });
    });

    expect(result.current).toEqual({
      status: 'success',
      profile: {
        id: 'profile-1',
        traits: { plan: 'pro' },
      },
      loading: false,
    });

    act(() => {
      emitProfileChange({
        status: 'success',
        profile: {
          id: 'profile-1',
          traits: { plan: 'enterprise' },
        },
        experiences: [{ id: 'exp-2' }],
      });
    });

    expect(result.current).toEqual({
      status: 'success',
      profile: {
        id: 'profile-1',
        traits: { plan: 'enterprise' },
      },
      loading: false,
    });
  });

  it('should process updates when profile changes metadata changes', () => {
    const { emitProfileChange } = setup();

    const { result } = renderHook(() => useProfile());

    act(() => {
      emitProfileChange({
        status: 'success',
        profile: {
          id: 'profile-1',
          traits: { plan: 'pro' },
        },
        experiences: [{ id: 'exp-1' }],
        changes: [
          {
            type: ChangeTypes.Variable,
            key: 'plan',
            value: {
              payload: {
                code: 'pro',
                values: [3, 1, 4],
                records: [{ id: 'x1', weight: 7 }],
              },
            },
            meta: { experienceId: 'exp-1', variantIndex: 1 },
          },
        ],
      });
    });

    expect(result.current).toEqual({
      status: 'success',
      profile: {
        id: 'profile-1',
        traits: { plan: 'pro' },
      },
      changes: [
        {
          type: ChangeTypes.Variable,
          key: 'plan',
          value: {
            payload: {
              code: 'pro',
              values: [3, 1, 4],
              records: [{ id: 'x1', weight: 7 }],
            },
          },
          meta: { experienceId: 'exp-1', variantIndex: 1 },
        },
      ],
      loading: false,
    });

    act(() => {
      emitProfileChange({
        status: 'success',
        profile: {
          id: 'profile-1',
          traits: { plan: 'pro' },
        },
        experiences: [{ id: 'exp-1' }],
        changes: [
          {
            type: ChangeTypes.Variable,
            key: 'plan',
            value: {
              payload: {
                code: 'enterprise',
                values: [3, 1, 4],
                records: [{ id: 'x1', weight: 7 }],
              },
            },
            meta: { experienceId: 'exp-1', variantIndex: 1 },
          },
        ],
      });
    });

    expect(result.current).toEqual({
      status: 'success',
      profile: {
        id: 'profile-1',
        traits: { plan: 'pro' },
      },
      changes: [
        {
          type: ChangeTypes.Variable,
          key: 'plan',
          value: {
            payload: {
              code: 'enterprise',
              values: [3, 1, 4],
              records: [{ id: 'x1', weight: 7 }],
            },
          },
          meta: { experienceId: 'exp-1', variantIndex: 1 },
        },
      ],
      loading: false,
    });
  });

  it('should unsubscribe on unmount', () => {
    const { unsubscribe } = setup();

    const { unmount } = renderHook(() => useProfile());

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
