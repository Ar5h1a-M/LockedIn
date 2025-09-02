import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from './page';
import { supabase } from '@/lib/supabaseClient';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock Supabase client
jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithOAuth: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Mock react-icons
jest.mock('react-icons/fc', () => ({
  FcGoogle: () => <div>GoogleIcon</div>,
}));

jest.mock('react-icons/fa', () => ({
  FaGraduationCap: () => <div>GraduationCapIcon</div>,
  FaBook: () => <div>BookIcon</div>,
  FaLightbulb: () => <div>LightbulbIcon</div>,
  FaPlus: () => <div>PlusIcon</div>,
  FaMinus: () => <div>MinusIcon</div>,
}));

// Mock Next.js Link component
jest.mock('next/link', () => ({ children, href }: { children: React.ReactNode; href: string }) => (
  <a href={href}>{children}</a>
));

// Mock global alert and fetch
global.alert = jest.fn();
global.fetch = jest.fn();

// Suppress specific console errors
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('unrecognized in this browser') ||
       args[0].includes('incorrect casing') ||
       args[0].includes('validateDOMNesting') ||
       args[0].includes('Not implemented'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

describe('SignUp Component - User Already Exists', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set environment variables
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000';
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  });

  it('handles user already exists error from backend', async () => {
    // Mock session
    (supabase.auth.getSession as jest.Mock).mockResolvedValue({
      data: { session: { access_token: 'mock-access-token' } },
    });

    // Mock degree and module options
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ 
        ok: true,
        text: () => Promise.resolve('Computer Science\nMathematics') 
      })
      .mockResolvedValueOnce({ 
        ok: true,
        text: () => Promise.resolve('Algorithms\nData Structures') 
      })
      // Mock API response for user already exists
      .mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: () => Promise.resolve({ error: 'User already exists' }),
      });

    render(<SignUp />);

    // Wait for degree options to load
    await waitFor(() => {
      expect(screen.getByText(/Computer Science/i)).toBeInTheDocument();
    });

    // Select degree
    await userEvent.selectOptions(screen.getByLabelText(/Degree/i), 'Computer Science');

    // Add module
    await userEvent.click(screen.getByText(/Add Module/i));

    // Wait for module select to appear
    await waitFor(() => {
      expect(screen.getAllByRole('combobox')).toHaveLength(2);
    });

    // Select module
    await userEvent.selectOptions(screen.getAllByRole('combobox')[1], 'Algorithms');

    // Enter study interest
    await userEvent.type(screen.getByLabelText(/Study Interest/i), 'Machine Learning');

    // Wait for signup API call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-access-token',
          }),
        })
      );
    });

    // Expect alert to be called
    await waitFor(() => {
      expect(alert).toHaveBeenCalledWith('User already exists');
    });

    // Expect signOut to be called
    await waitFor(() => {
      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });
});