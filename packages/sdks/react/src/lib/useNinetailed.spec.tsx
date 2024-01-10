import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useNinetailed } from './useNinetailed';
import { NinetailedContext } from './NinetailedContext';
import { Ninetailed } from '@ninetailed/experience.js';

describe('useNinetailed', () => {
  it('should return the passed ninetailed instance', () => {
    const ninetailed = new Ninetailed({ clientId: 'test' });

    const contextWrapper = ({ children }: React.PropsWithChildren) => {
      return (
        <NinetailedContext.Provider value={ninetailed}>
          {children}
        </NinetailedContext.Provider>
      );
    };

    const { result } = renderHook(() => useNinetailed(), {
      wrapper: contextWrapper,
    });

    expect(result.current).toBeInstanceOf(Ninetailed);
    expect(result.current).toEqual(ninetailed);
  });

  it('should throw an error if ninetailed context is not provided', () => {
    const { result } = renderHook(() => useNinetailed());

    expect(result.error).toEqual(
      new Error(
        'The component using the the context must be a descendant of the NinetailedProvider'
      )
    );
  });

  it('should throw an error if ninetailed instance is undefined', () => {
    const contextWrapper = ({ children }: React.PropsWithChildren) => {
      return (
        <NinetailedContext.Provider value={undefined}>
          {children}
        </NinetailedContext.Provider>
      );
    };

    const { result } = renderHook(() => useNinetailed(), {
      wrapper: contextWrapper,
    });

    expect(result.error).toEqual(
      new Error(
        'The component using the the context must be a descendant of the NinetailedProvider'
      )
    );
  });
});
