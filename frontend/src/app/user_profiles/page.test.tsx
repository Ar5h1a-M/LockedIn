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

function mockInitialProfile() {
  fetchMock
    .mockReset()
    // profile load
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        full_name: "Alice Smith",
        email: "alice@example.com",
        degree: "Computer Science",
        modules: ["Algorithms", "Data Structures"],
        interests: ["AI", "Web Development"],
      }),
    });
}

describe("User Profiles Page", () => {
  it("loads profile and shows fields", async () => {
    mockInitialProfile();
    render(<Page />);

    // Inputs are NOT label-associated; query by current values instead.
    const firstName = await screen.findByDisplayValue("Alice");
    const lastName = screen.getByDisplayValue("Smith");
    const email = screen.getByDisplayValue("alice@example.com");
    const degree = screen.getByDisplayValue("Computer Science");
    const modules = screen.getByDisplayValue("Algorithms, Data Structures");
    const interests = screen.getByDisplayValue("AI, Web Development");

    expect(firstName).toBeInTheDocument();
    expect(lastName).toBeInTheDocument();
    expect(email).toBeInTheDocument();
    expect(degree).toBeInTheDocument();
    expect(modules).toBeInTheDocument();
    expect(interests).toBeInTheDocument();
    expect(email).toHaveAttribute("disabled");
  });

  it("saves profile and shows success message", async () => {
    mockInitialProfile();
    // save call
    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<Page />);
    const user = userEvent.setup();

    // Edit first name via its current value
    const firstName = await screen.findByDisplayValue("Alice");
    await user.clear(firstName);
    await user.type(firstName, "Alicia");

    const saveBtn = screen.getByRole("button", { name: /save changes/i });
    await user.click(saveBtn);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const saveCall = fetchMock.mock.calls[1];
    expect(String(saveCall[0])).toMatch(/\/api\/profile\/update$/);
    expect(screen.getByText(/profile saved successfully/i)).toBeInTheDocument();
  });

  it("opens friends modal and lists friends", async () => {
    mockInitialProfile();
    // fetch friends when opening modal
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        friends: [{ id: "f1", full_name: "Bob Brown", email: "bob@example.com" }],
      }),
    });

    render(<Page />);
    const user = userEvent.setup();

    const friendsBtn = await screen.findByRole("button", { name: /friends/i });
    await user.click(friendsBtn);

    await waitFor(() => expect(screen.getByText(/your friends/i)).toBeInTheDocument());
    expect(screen.getByText(/bob brown/i)).toBeInTheDocument();
    expect(screen.getByText(/bob@example\.com/i)).toBeInTheDocument();
  });
});
