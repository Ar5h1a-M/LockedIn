import { render, screen, waitFor } from "@testing-library/react";
import GroupsPage from "./page";

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "t" } },
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

const fetchMock = jest.fn();
(global as any).fetch = fetchMock;

beforeEach(() => {
  fetchMock
    .mockReset()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ groups: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ friends: [] }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ invites: [] }) });
});

describe("GroupsPage", () => {
  it("renders groups layout", async () => {
    render(<GroupsPage />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: /Study Groups/i })).toBeInTheDocument();
  });
});
