import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupsPage from './page';

// Mock fetch
global.fetch = jest.fn();

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

describe('GroupsPage', () => {
  it('creates a new group and invites friends, updating the group list', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ groupId: 'g1' }),
    });

    render(<GroupsPage />);

    // Open modal
    const createBtn = screen.getByRole('button', { name: /Create Group/i });
    await userEvent.click(createBtn);

    // Fill group name and module
    const inputs = screen.getAllByRole('textbox');
    await userEvent.type(inputs[0], 'Test Group');
    await userEvent.type(inputs[1], 'Math101');

    // Go to next step
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    await userEvent.click(nextBtn);

    // Modal step 2
    const inviteHeading = await screen.findByRole('heading', { name: 'Invite Friends' });
    const modal = inviteHeading.closest('div') as HTMLElement;
    expect(screen.getByText('✓ Added')).toBeInTheDocument();

    // Submit final
    const submitBtn = within(modal).getByRole('button', { name: /Create group/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/api/groups'), expect.any(Object));
    });
  });

  it('shows group invitations in the sidebar and allows responding to them', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        invites: [{ id: 'i1', groupName: 'Other Group' }],
      }),
    });

    render(<GroupsPage />);

    const bellBtn = screen.getByRole('button', { name: '🔔' });
    await userEvent.click(bellBtn);

    await screen.findByText('Other Group');
  });

  it('validates group name when creating a group', async () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(<GroupsPage />);

    const createBtn = screen.getByRole('button', { name: /Create Group/i });
    await userEvent.click(createBtn);

    const nextBtn = screen.getByRole('button', { name: /Next/i });
    await userEvent.click(nextBtn);

    expect(alertSpy).toHaveBeenCalledWith('Group name required');
    expect(screen.getByLabelText(/Group name/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Invite Friends' })).toBeNull();

    alertSpy.mockRestore();
  });
});