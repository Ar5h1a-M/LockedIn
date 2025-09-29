import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "./page";

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "token" } },
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
    },
  },
}));

const fetchMock = jest.fn();
(global as any).fetch = fetchMock;

function primeFetchMocksForHappyPath() {
  fetchMock
    .mockReset()
    // initial load (entries, etc.)
    .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: [] }) })
    // POST save
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ entry: { date: "2025-09-29", hours: 2, productivity: 3, notes: "" } }),
    });
}

describe("Progress Tracker", () => {
  it("shows validation error initially and enables submit on valid hours", async () => {
    primeFetchMocksForHappyPath();
    render(<Page />);

    // Hours field has placeholder, not a label
    const hoursInput = await screen.findByPlaceholderText(/hours studied/i);
    const logButton = screen.getByRole("button", { name: /log hours/i });

    // Initial: invalid -> error + disabled
    expect(screen.getByText(/enter hours \(number > 0\)\./i)).toBeInTheDocument();
    expect(logButton).toBeDisabled();

    const user = userEvent.setup();
    await user.clear(hoursInput);
    await user.type(hoursInput, "2");

    await waitFor(() => expect(logButton).not.toBeDisabled());
    expect(screen.queryByText(/enter hours \(number > 0\)\./i)).toBeNull();
  });

  it("submits hours successfully", async () => {
    primeFetchMocksForHappyPath();
    render(<Page />);

    const user = userEvent.setup();
    const hoursInput = await screen.findByPlaceholderText(/hours studied/i);
    await user.clear(hoursInput);
    await user.type(hoursInput, "2");

    const logButton = screen.getByRole("button", { name: /log hours/i });
    await user.click(logButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    // Ensure POST to /api/progress happened
    expect(fetchMock.mock.calls[1][0]).toMatch(/\/api\/progress$/);
  });

  it("shows alert on save failure", async () => {
    const alertSpy = jest.spyOn(window, "alert").mockImplementation(() => {});
    fetchMock
      .mockReset()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: [] }) }) // initial
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Save failed" }) }); // post

    render(<Page />);

    const user = userEvent.setup();
    const hoursInput = await screen.findByPlaceholderText(/hours studied/i);
    await user.clear(hoursInput);
    await user.type(hoursInput, "1");
    const logButton = screen.getByRole("button", { name: /log hours/i });
    await user.click(logButton);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith("Save failed"));
    alertSpy.mockRestore();
  });
});
