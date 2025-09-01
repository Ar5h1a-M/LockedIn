import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressTracker from './page';
import { within } from '@testing-library/react';

const getWeeklySummary = () => {
  const heading = screen.getByRole('heading', { name: /Weekly Summary/i });
  const card = heading.closest('.card') as HTMLElement;
  return within(card);
};

// Mock supabase auth and onAuthStateChange
const mockGetSession = jest.fn().mockResolvedValue({
  data: { session: { access_token: 'fake_token' } },
});
const mockOnAuthStateChange = jest.fn().mockReturnValue({
  data: { subscription: { unsubscribe: jest.fn() } },
});

jest.mock('src/lib/supabaseClient');


describe('ProgressTracker page', () => {
  const OLD_ENV = process.env;
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = { ...OLD_ENV, NEXT_PUBLIC_API_URL: 'http://api.local' };
    // Spy on window.alert
    alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env = OLD_ENV;
    alertSpy.mockRestore();
  });

  it('shows placeholder when no entries have been logged', async () => {
    // Backend returns no entries
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entries: [] }),
    } as Response);

    render(<ProgressTracker />);

    // Verify initial fetch call
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.local/api/progress',
        expect.any(Object)
      )
    );
    // Should display placeholder text and no motivation section
    expect(
      screen.getByText(/No study hours logged yet/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/Motivation/i)).toBeNull();
  });

  it('loads and displays entries and a motivational message based on today’s hours', async () => {
    const today = new Date().toISOString().slice(0, 10);
    // Prepare one entry for today with >=4 hours to trigger the top motivation message
    const entries = [
      { date: today, hours: 4, productivity: 5, notes: 'Did project work' },
    ];
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ entries }),
    } as Response);

    render(<ProgressTracker />);

    // Wait for the entry to load into the UI
    await screen.findByText(today); // date of the entry appears in summary list
    // Check that the entry details are rendered in the summary list
    
    // helper that ignores whitespace/newlines between nodes
    const hasSummary = (needle: RegExp) =>
    (_: string, el?: Element | null) => !!el && needle.test(el.textContent || '');


    const summary = getWeeklySummary();
    expect(
    summary.getByText(
        hasSummary(new RegExp(`\\b${entries[0].hours}\\s*h\\s*\\(Productivity:\\s*${entries[0].productivity}\\s*/5\\)`))
    )
    ).toBeInTheDocument();

    expect(screen.getByText(hasSummary(/\(Did project work\)/))).toBeInTheDocument();
    // Summary totals should reflect the entry
    expect(
      screen.getByText(new RegExp(`This week: ${entries[0].hours} hours total`))
    ).toBeInTheDocument();
  });

  it('allows logging a new study entry and updates the summary list', async () => {
    const today = new Date().toISOString().slice(0, 10);
    // Initial load: no entries, then on log: returns new entry
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          entry: { date: today, hours: 2.5, productivity: 4, notes: 'some note' },
        }),
      } as Response);

    render(<ProgressTracker />);

    // Ensure initial state has no entries
    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.local/api/progress',
        expect.any(Object)
      )
    );
    // helper that ignores whitespace/newlines between nodes
    const hasSummary = (needle: RegExp) =>
    (_: string, el?: Element | null) => !!el && needle.test(el.textContent || '');
    
    const summary = getWeeklySummary();
    await summary.findByText(hasSummary(/2\.5\s*h\s*\(Productivity:\s*4\s*\/5\)/));
    expect(summary.getByText(hasSummary(/\(some note\)/))).toBeInTheDocument();


    // Fill out the log form fields
    const hoursInput = screen.getByPlaceholderText(/Hours studied/i) as HTMLInputElement;
    const notesInput = screen.getByPlaceholderText(/Optional notes/i) as HTMLInputElement;
    // (Date is preset to today by default; we leave it as is)
    await userEvent.type(hoursInput, '2.5');
    await userEvent.type(notesInput, 'some note');
    // Click "Log Hours"
    const logButton = screen.getByRole('button', { name: /Log Hours/i });
    await userEvent.click(logButton);

    // The component should call the POST API with the form data
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://api.local/api/progress',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: expect.stringMatching(/^Bearer /),
          }),
          body: expect.stringContaining(`"hours":2.5`), // ensure hours value is sent as number
        })
      );
    });
    // After saving, the new entry should be added to the list with correct details
    expect(screen.getByText(`${2.5}h (Productivity: 4/5)`)).toBeInTheDocument();
    expect(screen.getByText('(some note)')).toBeInTheDocument();
    // Motivation message should update for today's hours (2.5h triggers "Great job!")
    expect(
      screen.getByText(/Great job! Keep the momentum going!/i)
    ).toBeInTheDocument();
    // The input fields should be cleared/reset
    expect(hoursInput.value).toBe('');
    expect(notesInput.value).toBe('');
    // Productivity slider resets to 3 (default)
    expect(screen.getByText(/Productivity: 3\/5/)).toBeInTheDocument();
  });

  it('shows an error alert if saving a log entry fails', async () => {
    // Initial fetch ok, save attempt returns error
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ entries: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to save entry' }),
      } as Response);

    render(<ProgressTracker />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled()); // initial load
    // Fill required field (hours)
    const hoursInput = screen.getByPlaceholderText(/Hours studied/i);
    await userEvent.type(hoursInput, '1');
    // Click log hours to trigger failing save
    await userEvent.click(screen.getByRole('button', { name: /Log Hours/i }));

    // Expect an alert with the error message
    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Failed to save entry')
    );
    // Ensure the hours entry was not added (still showing placeholder)
    expect(screen.getByText(/No study hours logged yet/i)).toBeInTheDocument();
  });
});
