// frontend/src/app/login/page.network-error.test.tsx

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
      signOut: jest.fn().mockResolvedValue({}),
    },
  },
}));

describe("Login network error branch", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    global.fetch = fetchMock as typeof fetch;
    // throw on backend verify call
    fetchMock.mockImplementation(() => {
      throw new Error("boom");
    });
    // silence UI alert
    // @ts-ignore
    window.alert = jest.fn();
    
    // 👇 ADD THIS: Mock the environment variable
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
  });

  afterEach(() => {
    // 👇 ADD THIS: Clean up the environment variable
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it("handles thrown fetch", async () => {
    render(<Page />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
  });
});