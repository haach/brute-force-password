import { describe, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    const submitButton = screen.getByRole('button', { name: 'Hack it!' });
    expect(submitButton).toBeDisabled();
    fireEvent.change(passInput, { target: { value: 'abcde' } });
    expect(submitButton).toBeEnabled();
  });
  it('Detects ranges correctly', () => {
    render(<App />);
    const passInput = screen.getByRole('textbox', {
      name: 'Your test password',
    });

    const rangeLetters = screen.getByRole('range-checkbox-Letters');
    const rangeCapitals = screen.getByRole('range-checkbox-Capital-letters');
    const rangeNumericals = screen.getByRole(
      'range-checkbox-Numerical-characters'
    );
    const rangeSpecials = screen.getByRole('range-checkbox-Special-characters');

    fireEvent.change(passInput, { target: { value: 'abc' } });
    expect(rangeLetters).toHaveClass('MuiChip-colorSuccess');
    expect(rangeCapitals).toHaveClass('MuiChip-colorDefault');
    expect(rangeNumericals).toHaveClass('MuiChip-colorDefault');
    expect(rangeSpecials).toHaveClass('MuiChip-colorDefault');

    fireEvent.change(passInput, { target: { value: 'abcABC' } });
    expect(rangeLetters).toHaveClass('MuiChip-colorSuccess');
    expect(rangeCapitals).toHaveClass('MuiChip-colorSuccess');
    expect(rangeNumericals).toHaveClass('MuiChip-colorDefault');
    expect(rangeSpecials).toHaveClass('MuiChip-colorDefault');

    fireEvent.change(passInput, { target: { value: 'abcABC123' } });
    expect(rangeLetters).toHaveClass('MuiChip-colorSuccess');
    expect(rangeCapitals).toHaveClass('MuiChip-colorSuccess');
    expect(rangeNumericals).toHaveClass('MuiChip-colorSuccess');
    expect(rangeSpecials).toHaveClass('MuiChip-colorDefault');

    fireEvent.change(passInput, { target: { value: 'abcABC123!?§$%&' } });
    expect(rangeLetters).toHaveClass('MuiChip-colorSuccess');
    expect(rangeCapitals).toHaveClass('MuiChip-colorSuccess');
    expect(rangeNumericals).toHaveClass('MuiChip-colorSuccess');
    expect(rangeSpecials).toHaveClass('MuiChip-colorSuccess');
  });
});
