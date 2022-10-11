import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from 'src/App';

describe('App', () => {
  it('Renders the app', () => {
    render(<App />);
    /* expect(
      screen.getByText('Brute force hack my password!')
    ).toBeInTheDocument(); */
  });
});
