import { act, renderHook } from '@testing-library/react';
import { ChangeTypes } from '@ninetailed/experience.js-shared';
import { useFlagWithManualTracking } from './useFlagWithManualTracking';
import { useNinetailed } from './useNinetailed';

jest.mock('./useNinetailed');

describe('useFlagWithManualTracking', () => {
  type ChangesStateCallback = (state: {
    status: 'loading' | 'success' | 'error';
    changes: Array<{
      type: ChangeTypes;
      key: string;
      value: unknown;
      meta: { variantIndex: number; experienceId: string };
    }>;
    error: Error | null;
  }) => void;

  const setup = () => {
    let onChangesChangeCallback: ChangesStateCallback | null = null;

    const trackVariableComponentView = jest.fn();
    const onChangesChange = jest.fn((callback: ChangesStateCallback) => {
      onChangesChangeCallback = callback;
      return jest.fn();
    });

    (useNinetailed as jest.Mock).mockReturnValue({
      onChangesChange,
      trackVariableComponentView,
    });

    return {
      emitChangesState: (state: Parameters<ChangesStateCallback>[0]) => {
        if (!onChangesChangeCallback) {
          throw new Error('onChangesChange callback was not registered');
        }
        onChangesChangeCallback(state);
      },
      onChangesChange,
      trackVariableComponentView,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should ignore duplicate changes state updates with equal content', () => {
    const { emitChangesState } = setup();

    const { result } = renderHook(() =>
      useFlagWithManualTracking('my-flag', 'fallback')
    );

    const state = {
      status: 'success' as const,
      changes: [
        {
          type: ChangeTypes.Variable,
          key: 'my-flag',
          value: 'resolved',
          meta: {
            variantIndex: 1,
            experienceId: 'exp-1',
          },
        },
      ],
      error: null,
    };

    act(() => {
      emitChangesState(state);
    });

    expect(result.current[0]).toEqual({
      value: 'resolved',
      status: 'success',
      error: null,
    });

    act(() => {
      emitChangesState({
        status: 'success',
        changes: [
          {
            type: ChangeTypes.Variable,
            key: 'my-flag',
            value: 'resolved',
            meta: {
              variantIndex: 1,
              experienceId: 'exp-1',
            },
          },
        ],
        error: null,
      });
    });

    expect(result.current[0]).toEqual({
      value: 'resolved',
      status: 'success',
      error: null,
    });
  });

  it('should process non-duplicate changes state updates', () => {
    const { emitChangesState } = setup();

    const { result } = renderHook(() =>
      useFlagWithManualTracking('my-flag', 'fallback')
    );

    act(() => {
      emitChangesState({
        status: 'success',
        changes: [
          {
            type: ChangeTypes.Variable,
            key: 'my-flag',
            value: 'resolved-1',
            meta: {
              variantIndex: 1,
              experienceId: 'exp-1',
            },
          },
        ],
        error: null,
      });
    });

    expect(result.current[0]).toEqual({
      value: 'resolved-1',
      status: 'success',
      error: null,
    });

    act(() => {
      emitChangesState({
        status: 'success',
        changes: [
          {
            type: ChangeTypes.Variable,
            key: 'my-flag',
            value: 'resolved-2',
            meta: {
              variantIndex: 2,
              experienceId: 'exp-2',
            },
          },
        ],
        error: null,
      });
    });

    expect(result.current[0]).toEqual({
      value: 'resolved-2',
      status: 'success',
      error: null,
    });
  });

  it('should reset when default value changes', () => {
    setup();

    const { result, rerender } = renderHook(
      ({ defaultValue }) => useFlagWithManualTracking('my-flag', defaultValue),
      {
        initialProps: { defaultValue: { enabled: true } },
      }
    );

    expect(result.current[0]).toEqual({
      value: { enabled: true },
      status: 'loading',
      error: null,
    });

    rerender({ defaultValue: { enabled: false } });

    expect(result.current[0]).toEqual({
      value: { enabled: false },
      status: 'loading',
      error: null,
    });
  });

  it('should track current variable when track is called', () => {
    const { emitChangesState, trackVariableComponentView } = setup();

    const { result } = renderHook(() =>
      useFlagWithManualTracking('my-flag', 'fallback')
    );

    act(() => {
      emitChangesState({
        status: 'success',
        changes: [
          {
            type: ChangeTypes.Variable,
            key: 'my-flag',
            value: 'resolved',
            meta: {
              variantIndex: 2,
              experienceId: 'exp-2',
            },
          },
        ],
        error: null,
      });
    });

    act(() => {
      result.current[1]();
    });

    expect(trackVariableComponentView).toHaveBeenCalledWith({
      variable: 'resolved',
      variant: { id: 'Variable-my-flag' },
      componentType: 'Variable',
      variantIndex: 2,
      experienceId: 'exp-2',
    });
  });
});
