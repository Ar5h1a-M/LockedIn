import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "./page";

// Mock supabase auth
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "t" } },
      }),
    },
  },
}));

// Mock fetch for groups/sessions/progress endpoints used internally
const fetchMock = jest.fn();
global.fetch = fetchMock as typeof fetch;

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue({
    ok: true,
    json: async () => ({ groups: [{ id: "g1", name: "ChemE" }], sessions: [], entries: [] }),
  });
});

describe("DashboardPage", () => {
  it("renders dashboard heading and sections", async () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Student Dashboard/i)).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });
});
