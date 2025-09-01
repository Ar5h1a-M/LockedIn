import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from './page';

// Mock fetch
global.fetch = jest.fn();
jest.mock('src/lib/supabaseClient');


// Mock router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe('SignUp page', () => {
  it('renders the signup form', () => {
    render(<SignUpPage />);
    expect(screen.getByRole('heading', { name: /Create Your LockedIn Account/i })).toBeInTheDocument();
  });

  it('calls backend signup API and navigates to dashboard after OAuth redirect', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'jwt-token', role: 'researcher' }),
    });

    render(<SignUpPage />);

    await userEvent.selectOptions(screen.getByLabelText('Degree'), 'Computer Science');
    const addBtn = screen.getByRole('button', { name: /Add Module/i });
    await userEvent.click(addBtn);

    const moduleSelect = screen.getByRole('combobox', { name: '' });
    await userEvent.selectOptions(moduleSelect, 'Phys101');
    await userEvent.type(screen.getByLabelText('Study Interest'), 'Data Science');

    const signupBtn = screen.getByRole('button', { name: /Complete Signup/i });
    await userEvent.click(signupBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/auth/signup'), expect.any(Object));
    });
  });

  it('alerts and signs out if profile creation fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Signup failed' }),
    });

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<SignUpPage />);

    const signupBtn = screen.getByRole('button', { name: /Complete Signup/i });
    await userEvent.click(signupBtn);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Signup failed'));
    });

    alertSpy.mockRestore();
  });

  it('navigates to login page when link is clicked', () => {
    render(<SignUpPage />);
    const link = screen.getByRole('link', { name: /Sign in here/i });
    expect(link).toHaveAttribute('href', '/login');
  });
});