import { render, waitFor } from "@testing-library/react";
import Page from "./page";

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: "tok" } },
      }),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      // ✅ your component calls signOut() on failure
      signOut: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe("Login network error branch", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    (global as any).fetch = fetchMock;
    // throw on backend verify call
    fetchMock.mockImplementation(() => {
      throw new Error("boom");
    });
    // silence UI alert
    // @ts-ignore
    window.alert = jest.fn();
  });

  it("handles thrown fetch", async () => {
    render(<Page />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });
});

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { access_token: "tok" } } }),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
      // 👇 add this to satisfy page.tsx error branch
      signOut: jest.fn().mockResolvedValue({}),
    },
  },
}));
