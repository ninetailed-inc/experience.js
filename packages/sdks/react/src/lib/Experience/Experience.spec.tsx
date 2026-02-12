import React from 'react';
import { render } from '@testing-library/react';
import type { NinetailedInstance } from '@ninetailed/experience.js';

import { DefaultExperienceLoadingComponent } from './Experience';
import { NinetailedContext } from '../NinetailedContext';

describe('DefaultExperienceLoadingComponent', () => {
  it('hides loading baseline content from assistive technologies', () => {
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

    expect(container.firstElementChild?.getAttribute('aria-hidden')).toBe(
      'true'
    );
  });
});
