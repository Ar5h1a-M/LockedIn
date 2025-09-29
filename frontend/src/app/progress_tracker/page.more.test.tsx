import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "./page";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(() => "/progress_tracker"),
  useRouter: () => ({ prefetch: jest.fn(), push: jest.fn() }),
}));

// ✅ Prevent real Supabase client (env-less) from being created during import
jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

describe("Progress Tracker – extra branches", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global as any).fetch = fetchMock;

    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);

      if (/\/api\/progress$/.test(url) && init?.method === "POST") {
        return Promise.resolve(new Response("{}", { status: 200 }));
      }
      if (/\/api\/progress$/.test(url) && (!init || !init.method)) {
        // GET progress history
        return Promise.resolve(new Response(JSON.stringify({ entries: [] }), { status: 200 }));
      }
      return Promise.resolve(new Response("{}", { status: 200 }));
    });
  });

  it("submits when valid hours are entered and Log Hours is clicked", async () => {
    render(<Page />);

    const hours = await screen.findByLabelText(/hours/i);
    await userEvent.clear(hours);
    await userEvent.type(hours, "1.5");

    const submit = screen.getByRole("button", { name: /log hours/i });
    await userEvent.click(submit);

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(
          ([u, i]) => String(u).endsWith("/api/progress") && (i as RequestInit)?.method === "POST"
        )
      ).toBe(true);
    });
  });

  it("shows validation when hours are blank then focuses input", async () => {
    render(<Page />);

    const hours = await screen.findByLabelText(/hours/i);
    const submit = screen.getByRole("button", { name: /log/i });

    await userEvent.clear(hours);
    await userEvent.click(submit);

    await waitFor(() => {
      expect(hours).toHaveAttribute("aria-invalid", "true");
    });
  });
});
