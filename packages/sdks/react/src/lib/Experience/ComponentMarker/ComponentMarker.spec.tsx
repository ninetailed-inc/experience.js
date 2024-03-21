import { useEffect, useRef } from 'react';
import { render, screen } from '@testing-library/react';

import { ComponentMarker } from './ComponentMarker';

jest.mock('../../useNinetailed', () => ({
  useNinetailed: jest.fn().mockReturnValue({ logger: { debug: jest.fn() } }),
}));

/**
 *
 * Adds a class to the DOM element that sould act as the observable element.
 * It makes testing if the correct element is selected easier.
 */
const useObservableElement = () => {
  const observableElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    observableElementRef.current?.classList.add('found');
  }, []);

  return observableElementRef;
};

/**
 *
 * The DOM element with the data-testid `observable` is the one we know should be selected as the observable element.
 */
const getObservable = () => screen.getByTestId('observable');

const assertObservableIsFound = () => {
  try {
    /**
     * If the DOM element we know should be selected as the observable has the class `found`, it means that the ComponentMarker has correctly selected it as well.
     */
    expect(getObservable()).toHaveClass('found');
  } catch (error) {
    throw new Error(
      `Expected the observable element to be found, but it was not.`
    );
  }
};

describe('ComponentMarker', () => {
  it('renders a div with display: none', () => {
    const { container } = render(<ComponentMarker />);
    const div = container.children.item(0);

    expect(div).toHaveStyle('display: none');
  });

  it('should find the observable as next sibling', () => {
    const ObservableIsNextSibling = () => {
      const ref = useObservableElement();

      return (
        <>
          <ComponentMarker ref={ref} />
          <div data-testid="observable"></div>
        </>
      );
    };
    render(<ObservableIsNextSibling />);

    assertObservableIsFound();
  });

  it('should find the observable as next sibling that is not display: none', () => {
    const ObservableIsNextSiblingWithoutDisplayNone = () => {
      const ref = useObservableElement();

      return (
        <>
          <ComponentMarker ref={ref} />
          <div style={{ display: 'none' }}></div>
          <div data-testid="observable"></div>
        </>
      );
    };

    render(<ObservableIsNextSiblingWithoutDisplayNone />);

    assertObservableIsFound();
  });

  it('should find the observable as next sibling of the parent', () => {
    const ObservableIsParentNextSibling = () => {
      const ref = useObservableElement();

      return (
        <>
          <div>
            <ComponentMarker ref={ref} />
          </div>
          <div data-testid="observable"></div>
        </>
      );
    };

    render(<ObservableIsParentNextSibling />);

    assertObservableIsFound();
  });

  it('should find the observable as next sibling of the parent that is not display: none', () => {
    const ObservableIsParentNextSiblingWithoutDisplayNone = () => {
      const ref = useObservableElement();

      return (
        <>
          <div>
            <ComponentMarker ref={ref} />
          </div>
          <div style={{ display: 'none' }}></div>
          <div data-testid="observable"></div>
        </>
      );
    };

    render(<ObservableIsParentNextSiblingWithoutDisplayNone />);

    assertObservableIsFound();
  });
});
