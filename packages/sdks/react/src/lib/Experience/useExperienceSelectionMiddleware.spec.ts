import { act, renderHook } from '@testing-library/react-hooks';
import { useExperienceSelectionMiddleware } from './useExperienceSelectionMiddleware';
import { makeExperienceSelectMiddleware } from '@ninetailed/experience.js';

jest.mock('../useNinetailed', () => ({
  useNinetailed: jest.fn(() => ({
    plugins: [],
  })),
}));

const addListeners = jest.fn();
const removeListeners = jest.fn();
const middleware = jest.fn();

jest.mock('@ninetailed/experience.js', () => ({
  makeExperienceSelectMiddleware: jest.fn(() => ({
    addListeners,
    removeListeners,
    middleware,
  })),
}));

describe('useExperienceSelectionMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a middleware function', () => {
    const { result } = renderHook(() =>
      useExperienceSelectionMiddleware({
        experiences: [],
        baseline: { id: 'baseline' },
        profile: null,
      })
    );

    expect(makeExperienceSelectMiddleware).toHaveBeenCalledWith({
      plugins: [],
      experiences: [],
      baseline: { id: 'baseline' },
      profile: null,
      onChange: expect.any(Function),
    });

    expect(result.current).toBe(middleware);
  });

  it('should update the state when onChange is called', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1);

    renderHook(() =>
      useExperienceSelectionMiddleware({
        experiences: [],
        baseline: { id: 'baseline' },
        profile: null,
      })
    );

    act(() => {
      (makeExperienceSelectMiddleware as jest.Mock).mock.calls[0][0].onChange();
    });

    /**
     * Date.now is called once when the component is mounted and then again when onChange is called
     */
    expect(Date.now).toHaveBeenCalledTimes(2);
  });

  it('should call addListeners on mount', () => {
    const { result } = renderHook(() =>
      useExperienceSelectionMiddleware({
        experiences: [],
        baseline: { id: 'baseline' },
        profile: null,
      })
    );

    expect(addListeners).toHaveBeenCalledTimes(1);
  });

  it('should call removeListeners on unmount', () => {
    const { unmount } = renderHook(() =>
      useExperienceSelectionMiddleware({
        experiences: [],
        baseline: { id: 'baseline' },
        profile: null,
      })
    );

    expect(removeListeners).toHaveBeenCalledTimes(0);

    unmount();

    expect(removeListeners).toHaveBeenCalledTimes(1);
  });
});
