import React from 'react';
import { act, render, screen } from '@testing-library/react';
import type { NinetailedInstance } from '@ninetailed/experience.js';

import { DefaultExperienceLoadingComponent } from './Experience';
import { NinetailedContext } from '../NinetailedContext';

describe('DefaultExperienceLoadingComponent', () => {
  const renderLoadingComponent = () => {
    const logger = { error: jest.fn() };

    return render(
      <NinetailedContext.Provider
        value={{ logger } as unknown as NinetailedInstance}
      >
        <DefaultExperienceLoadingComponent
          id="baseline-entry"
          component={() => <button type="button">CTA</button>}
          experiences={[]}
        />
      </NinetailedContext.Provider>
    );
  };

  it('hides loading baseline content from assistive technologies', () => {
    const { container } = renderLoadingComponent();

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });

  it('prevents pointer interaction with loading baseline content', () => {
    const { container } = renderLoadingComponent();

    expect(
      (container.firstElementChild as HTMLDivElement).style.pointerEvents
    ).toBe('none');
  });

  it('keeps layout while visually hiding loading baseline content', () => {
    const { container } = renderLoadingComponent();

    expect(
      (container.firstElementChild as HTMLDivElement).style.visibility
    ).toBe('hidden');
  });

  it('respects unhideAfterMs before revealing baseline', () => {
    // This test controls time so we can assert hidden -> visible transition exactly.
    jest.useFakeTimers();
    const logger = { error: jest.fn() };

    const { container } = render(
      <NinetailedContext.Provider
        value={{ logger } as unknown as NinetailedInstance}
      >
        <DefaultExperienceLoadingComponent
          id="baseline-entry"
          component={() => <button type="button">CTA</button>}
          experiences={[]}
          unhideAfterMs={100}
        />
      </NinetailedContext.Provider>
    );

    act(() => {
      // Still before the threshold: component must remain hidden and silent.
      jest.advanceTimersByTime(99);
    });

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(screen.queryByRole('button', { name: 'CTA' })).toBeNull();
    expect(logger.error).not.toHaveBeenCalled();

    act(() => {
      // Reaching the threshold should reveal baseline and emit one warning log.
      jest.advanceTimersByTime(1);
    });

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBeNull();
    expect(screen.getByRole('button', { name: 'CTA' })).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  it('reveals baseline after the default timeout (5000ms)', () => {
    // Verify default behavior when unhideAfterMs is not provided.
    jest.useFakeTimers();
    const logger = { error: jest.fn() };

    const { container } = render(
      <NinetailedContext.Provider
        value={{ logger } as unknown as NinetailedInstance}
      >
        <DefaultExperienceLoadingComponent
          id="baseline-entry"
          component={() => <button type="button">CTA</button>}
          experiences={[]}
        />
      </NinetailedContext.Provider>
    );

    act(() => {
      // One millisecond before default threshold: still hidden.
      jest.advanceTimersByTime(4999);
    });

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true'
    );
    expect(screen.queryByRole('button', { name: 'CTA' })).toBeNull();

    act(() => {
      // At exactly 5000ms: baseline is revealed and warning is logged.
      jest.advanceTimersByTime(1);
    });

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBeNull();
    expect(screen.getByRole('button', { name: 'CTA' })).toBeInTheDocument();
    expect(logger.error).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
