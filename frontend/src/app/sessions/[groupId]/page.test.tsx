import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupSessionsPage from './page';

// Router mock
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

// Supabase client used by the page (prevent real client creation)
jest.mock('src/lib/supabaseClient');

const OLD_ENV = process.env;
let alertSpy: jest.SpyInstance;

beforeAll(() => {
  process.env = { ...OLD_ENV, NEXT_PUBLIC_API_URL: 'http://api.local' };
  alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
});

afterAll(() => {
  process.env = OLD_ENV;
  alertSpy.mockRestore();
});

beforeEach(() => {
  jest.clearAllMocks();
  // fresh fetch mock per test
  global.fetch = jest.fn() as any;
});

describe('GroupSessionsPage', () => {
  it('loads and displays sessions and chat messages on mount', async () => {
    const session1 = {
      id: 's1',
      group_id: 'group1',
      creator_id: 'user1',
      start_at: new Date('2025-01-01T12:00:00Z').toISOString(),
      venue: 'Library Room 3',
      topic: 'Algebra',
      time_goal_minutes: 60,
      content_goal: 'Finish exercise',
    };
    const session2 = {
      id: 's2',
      group_id: 'group1',
      creator_id: 'otherUser',
      start_at: new Date('2025-01-02T15:30:00Z').toISOString(),
      venue: null,
      topic: null,
      time_goal_minutes: null,
      content_goal: null,
    };
    const message1 = {
      id: 1,
      group_id: 'group1',
      session_id: null,
      sender_id: 'otherUser',
      sender_name: 'Alice',
      content: 'Hello group',
      attachment_url: null,
      created_at: new Date().toISOString(),
    };
    const message2 = {
      id: 2,
      group_id: 'group1',
      session_id: null,
      sender_id: 'user1',
      sender_name: 'Me Myself',
      content: 'Hi there',
      attachment_url: null,
      created_at: new Date().toISOString(),
    };

    (global.fetch as jest.Mock)
      // GET sessions
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [session1, session2] }),
      } as Response)
      // GET messages
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [message1, message2] }),
      } as Response);

    render(<GroupSessionsPage />);

    // Wait for sessions to render
    await screen.findByText('Library Room 3');

    // Session1 details
    expect(screen.getByText('Venue: Library Room 3')).toBeInTheDocument();
    expect(screen.getByText('Topic: Algebra')).toBeInTheDocument();
    expect(screen.getByText('Time goal: 60 min')).toBeInTheDocument();
    expect(screen.getByText('Content goal: Finish exercise')).toBeInTheDocument();

    // Creator is me -> Delete button present
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();

    // Session2 null fields
    expect(screen.getByText('Venue: —')).toBeInTheDocument();
    expect(screen.getByText('Topic: —')).toBeInTheDocument();

    // Chat messages
    expect(screen.getByText('Hello group')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Me Myself')).toBeNull();
  });

  it('allows creating a new study session and updates the upcoming sessions list', async () => {
    // initial load
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      } as Response);

    render(<GroupSessionsPage />);

    const addBtn = screen.getByRole('button', { name: /New Session/i });
    await userEvent.click(addBtn);

    await userEvent.type(screen.getByLabelText(/Venue/i), 'CS Lab');
    await userEvent.type(screen.getByLabelText(/Topic/i), 'DP');
    await userEvent.clear(screen.getByLabelText(/Time goal/i));
    await userEvent.type(screen.getByLabelText(/Time goal/i), '45');
    await userEvent.type(screen.getByLabelText(/Content goal/i), 'Finish HW');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'created', ...{} }),
    } as Response);

    const createBtn = screen.getByRole('button', { name: /Create/i });
    await userEvent.click(createBtn);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions'),
        expect.objectContaining({ method: 'POST' })
      )
    );
  });

  it('allows deleting a session (only for the creator) and updates the list', async () => {
    const mine = {
      id: 's1',
      group_id: 'group1',
      creator_id: 'user1',
      start_at: new Date('2025-01-01T12:00:00Z').toISOString(),
      venue: 'A',
      topic: 'B',
      time_goal_minutes: 30,
      content_goal: 'C',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [mine] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ messages: [] }),
      } as Response);

    render(<GroupSessionsPage />);

    await screen.findByText('Venue: A');

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true } as Response);

    const delBtn = screen.getByRole('button', { name: /Delete/i });
    await userEvent.click(delBtn);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/sessions/${mine.id}`),
        expect.objectContaining({ method: 'DELETE' })
      )
    );
  });

  it('sends a text message in group chat and displays it', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ sessions: [] }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) } as Response);

    render(<GroupSessionsPage />);

    const input = screen.getByPlaceholderText(/Write a message/i);
    await userEvent.type(input, 'hello all');

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true } as Response);

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    await userEvent.click(sendBtn);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/groups/'),
        expect.objectContaining({ method: 'POST' })
      )
    );
  });

  it('uploads a file attachment and displays the attachment link in chat', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ sessions: [] }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) } as Response);

    render(<GroupSessionsPage />);

    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    const fileInput = screen.getByLabelText(/Attach file/i);
    await userEvent.upload(fileInput, file);

    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true } as Response);

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    await userEvent.click(sendBtn);

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/groups/'),
        expect.objectContaining({ method: 'POST' })
      )
    );
  });

  it('alerts on error if sending a message fails', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ sessions: [] }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ messages: [] }) } as Response);

    render(<GroupSessionsPage />);

    const input = screen.getByPlaceholderText(/Write a message/i);
    await userEvent.type(input, 'oops');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'send failed' }),
    } as Response);

    const sendBtn = screen.getByRole('button', { name: /Send/i });
    await userEvent.click(sendBtn);

    await waitFor(() => expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('send failed')));
  });
});
