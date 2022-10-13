import { describe, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from 'src/App';

describe('App', () => {
  it('Renders the app', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Brute force hack my password' })
    ).toBeInTheDocument();
  });
  it('Allows for input', () => {
    render(<App />);
    const passInput = screen.getByRole('textbox', {
      name: 'Your test password',
    });
    fireEvent.change(passInput, { target: { value: 'abcde' } });
    const submitButton = screen.getByRole('button', { name: 'Hack it!' });
    expect(submitButton).not.toBeDisabled();
  });
});
