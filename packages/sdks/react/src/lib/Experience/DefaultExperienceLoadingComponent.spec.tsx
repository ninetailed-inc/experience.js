import React from 'react';
import { act, render, screen } from '@testing-library/react';
import type { NinetailedInstance } from '@ninetailed/experience.js';

import { DefaultExperienceLoadingComponent } from './DefaultExperienceLoadingComponent';
import { NinetailedContext } from '../NinetailedContext';

describe('DefaultExperienceLoadingComponent', () => {
  const renderLoadingComponent = ({
    unhideAfterMs,
    logger = { error: jest.fn() },
  }: {
    unhideAfterMs?: number;
    logger?: { error: jest.Mock };
  } = {}) => {
    const result = render(
      <NinetailedContext.Provider
        value={{ logger } as unknown as NinetailedInstance}
      >
        <DefaultExperienceLoadingComponent
          id="baseline-entry"
          component={() => <button type="button">CTA</button>}
          experiences={[]}
          {...(unhideAfterMs !== undefined ? { unhideAfterMs } : {})}
        />
      </NinetailedContext.Provider>
    );

    return { ...result, logger };
  };

  describe('when hidden', () => {
    it('hides loading baseline content from assistive technologies', () => {
      const { container } = renderLoadingComponent();

      expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
        'true'
      );

      // queryByRole checks the accessibility tree; aria-hidden removes this button from it.
      expect(screen.queryByRole('button', { name: 'CTA' })).toBeNull();
    });

    it('prevents pointer interaction with loading baseline content', () => {
      const { container } = renderLoadingComponent();

      expect(
        (container.firstElementChild as HTMLDivElement).style.pointerEvents
      ).toBe('none');
    });

    it('marks loading baseline content as inert', () => {
      const { container } = renderLoadingComponent();

      expect(container.firstElementChild?.hasAttribute('inert')).toBe(true);
    });

    it('keeps layout while visually hiding loading baseline content', () => {
      const { container } = renderLoadingComponent();

      expect(
        (container.firstElementChild as HTMLDivElement).style.visibility
      ).toBe('hidden');
    });

    describe('reveal timing', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('respects unhideAfterMs before revealing baseline', () => {
        const { logger } = renderLoadingComponent({
          unhideAfterMs: 100,
        });

        act(() => {
          jest.advanceTimersByTime(99);
        });

        // the timer hasn't reached the unhideAfterMs value yet, so the baseline remains hidden
        expect(screen.queryByRole('button', { name: 'CTA' })).toBeNull();
        expect(logger.error).not.toHaveBeenCalled();
      });

      it('respects default unhideAfterMs before revealing baseline', () => {
        const { logger } = renderLoadingComponent();

        act(() => {
          jest.advanceTimersByTime(4999);
        });

        // the timer hasn't reached the default unhideAfterMs value yet, so the baseline remains hidden
        expect(screen.queryByRole('button', { name: 'CTA' })).toBeNull();
        expect(logger.error).not.toHaveBeenCalled();
      });

      it('reveals baseline once unhideAfterMs elapses', () => {
        const { logger } = renderLoadingComponent();

        act(() => {
          jest.advanceTimersByTime(5000);
        });

        expect(
          screen.queryByRole('button', { name: 'CTA' })
        ).toBeInTheDocument();

        expect(logger.error).toHaveBeenCalledTimes(1);
      });
    });

    describe('when unmounted', () => {
      beforeEach(() => {
        jest.useFakeTimers();
      });

      afterEach(() => {
        jest.useRealTimers();
      });

      it('cleans up timeout and does not log after unmount when unhideAfterMs elapsed', () => {
        const logger = { error: jest.fn() };

        const { unmount } = renderLoadingComponent({
          unhideAfterMs: 100,
          logger,
        });

        unmount();

        act(() => {
          jest.advanceTimersByTime(100);
        });

        expect(logger.error).not.toHaveBeenCalled();
      });

      it('cleans up timeout and does not log after unmount before unhideAfterMs elapses', () => {
        const logger = { error: jest.fn() };

        const { unmount } = renderLoadingComponent({
          unhideAfterMs: 100,
          logger,
        });

        act(() => {
          // Move right up to the timeout boundary while still mounted.
          jest.advanceTimersByTime(99);
        });

        // Unmount before the timeout callback would fire.
        unmount();

        act(() => {
          // Advance past the remaining 1ms so the previously scheduled timeout would run if not cleared.
          jest.advanceTimersByTime(1);
        });

        // Cleanup should prevent the delayed warning from running.
        expect(logger.error).not.toHaveBeenCalled();
      });
    });
  });

  describe('when revealed', () => {
    let container: HTMLElement;

    beforeEach(() => {
      jest.useFakeTimers();

      const renderResult = renderLoadingComponent({ unhideAfterMs: 100 });
      container = renderResult.container;

      act(() => {
        // advance the timer by the unhideAfterMs value to get out of the hidden state
        jest.advanceTimersByTime(100);
      });
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('does not hide baseline content from assistive technologies', () => {
      expect(
        container.firstElementChild?.getAttribute('aria-hidden')
      ).toBeNull();

      // getByRole succeeds again because revealed content is present in the accessibility tree.
      expect(screen.getByRole('button', { name: 'CTA' })).toBeInTheDocument();
    });

    it('does not prevent pointer interaction after reveal', () => {
      expect(
        (container.firstElementChild as HTMLElement).style.pointerEvents
      ).not.toBe('none');
    });

    it('does not mark baseline content as inert after reveal', () => {
      expect(container.firstElementChild?.hasAttribute('inert')).toBe(false);
    });

    it('does not keep baseline content visually hidden after reveal', () => {
      expect(
        (container.firstElementChild as HTMLElement).style.visibility
      ).not.toBe('hidden');
    });
  });
});
