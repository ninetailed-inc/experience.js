import React from 'react';
import { render, screen } from '@testing-library/react';

describe('Index', () => {
  it('should render successfully', () => {
    render(
      <div>
        <h1>Heading</h1>
      </div>
    );
    const headline = screen.getByText('Heading');
    expect(headline).toBeInTheDocument();
  });
});
