import React from 'react';
import { render } from '@testing-library/react';
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
});
