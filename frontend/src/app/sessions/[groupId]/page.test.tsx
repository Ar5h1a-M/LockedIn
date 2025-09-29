import { render, screen, waitFor } from "@testing-library/react";
import Page from "./page";

jest.mock("next/navigation", () => ({
  useParams: () => ({ groupId: "g1" }),
  usePathname: () => "/sessions/g1",
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), prefetch: jest.fn() }),
}));

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
  fetchMock.mockReset()
    // sessions list for the group
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        sessions: [
          { id: "s1", title: "Math session", starts_at: "2025-10-01T12:00:00Z" },
        ],
      }),
    })
    // group members (if the page requests)
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ members: [] }),
    });
});

describe("Sessions/[groupId] page", () => {
  it("renders and loads sessions for the group", async () => {
    render(<Page params={{ groupId: "g1" }} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: /sessions/i })).toBeInTheDocument();
    expect(screen.getByText(/Math session/i)).toBeInTheDocument();
  });
});
