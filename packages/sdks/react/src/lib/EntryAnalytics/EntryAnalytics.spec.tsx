// EntryAnalytics.test.tsx
import React from 'react';
import { render } from '@testing-library/react';
import { Experience } from '../Experience';
import { EntryAnalytics } from './EntryAnalytics';

// Mock the Experience component (returning null is fine for our purposes)
jest.mock('../Experience', () => {
  const Experience = jest.fn(() => null);
  return { Experience };
});

type GreetingProps = { name: string; count?: number };
const Greeting: React.FC<GreetingProps> = () => null;

describe('EntryAnalytics', () => {
  beforeEach(() => {
    (Experience as unknown as jest.Mock).mockClear();
  });

  it('forwards id, component, and passthrough props similarly to Experience', () => {
    render(
      <EntryAnalytics
        id="entry-123"
        component={Greeting}
        {...{ name: 'Alice' }}
        passthroughProps={{ name: 'Alice', count: 3 }}
      />
    );

    const mock = Experience as unknown as jest.Mock;
    expect(mock).toHaveBeenCalledTimes(1);
    const passed = mock.mock.calls[0][0];

    // key props forwarded
    expect(passed.id).toBe('entry-123');
    expect(passed.component).toBe(Greeting);
    expect(passed.name).toBe('Alice');
    expect(passed.count).toBe(3);
  });

  it('always sets `experiences` to an empty array (ignores any provided value)', () => {
    render(
      <EntryAnalytics
        id="entry-xyz"
        component={Greeting}
        {...{ name: 'Bob' }}
        // @ts-expect-error -- runtime behavior
        passthroughProps={{ name: 'Bob', experiences: ['nope'] }}
        {...{ experiences: ['still-nope'] }}
      />
    );

    const passed = (Experience as unknown as jest.Mock).mock.calls[0][0];
    expect(passed.experiences).toEqual([]);
  });

  it('ensures the explicit id from `entry` wins over any id inside passthroughProps', () => {
    render(
      <EntryAnalytics<GreetingProps>
        id="canonical-id"
        component={Greeting}
        baseline={{ name: 'Dana' }}
        // @ts-expect-error -- runtime behavior
        passthroughProps={{ name: 'Dana', id: 'shadow-id' }}
      />
    );

    const passed = (Experience as unknown as jest.Mock).mock.calls[0][0];
    expect(passed.id).toBe('canonical-id');
  });

  it('forwards the optional trackClicks prop to Experience', () => {
    render(
      <EntryAnalytics
        id="entry-clicks"
        component={Greeting}
        {...{ name: 'Carol' }}
        trackClicks
      />
    );

    const passed = (Experience as unknown as jest.Mock).mock.calls[0][0];
    expect(passed.trackClicks).toBe(true);
  });
});
