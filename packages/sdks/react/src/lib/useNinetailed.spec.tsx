import React from 'react';
import { renderHook } from '@testing-library/react';
import { useNinetailed } from './useNinetailed';
import { NinetailedContext } from './NinetailedContext';
import { Ninetailed } from '@ninetailed/experience.js';
describe('useNinetailed', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {
      // Mocking console.error with an empty implementation
      // to prevent the error from being displayed in the console
      // when exceptions are thrown
    });
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
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
    try {
      renderHook(() => useNinetailed());
    } catch (error) {
      expect(error).toEqual(
        new Error(
          'The component using the the context must be a descendant of the NinetailedProvider'
        )
      );
    }
  });
  it('should throw an error if ninetailed instance is undefined', () => {
    const contextWrapper = ({ children }: React.PropsWithChildren) => {
      return (
        <NinetailedContext.Provider value={undefined}>
          {children}
        </NinetailedContext.Provider>
      );
    };
    try {
      renderHook(() => useNinetailed(), {
        wrapper: contextWrapper,
      });
    } catch (error) {
      expect(error).toEqual(
        new Error(
          'The component using the the context must be a descendant of the NinetailedProvider'
        )
      );
    }
  });
});
