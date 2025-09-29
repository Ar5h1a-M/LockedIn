import { authFetch } from "./useAuthFetch";

jest.mock("@/lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

const supabase = require("@/lib/supabaseClient").supabase;

describe("authFetch", () => {
  it("throws without token", async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    await expect(authFetch("/api/x")).rejects.toThrow(/Unauthorized/);
  });

  it("attaches Authorization header", async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: "abc" } },
    });
    const globalFetch = jest
      .spyOn(global as any, "fetch")
      .mockResolvedValue({ ok: true } as any);

    await authFetch("/api/x", { method: "POST", body: JSON.stringify({}) });

    expect(globalFetch).toHaveBeenCalled();
    const [, init] = (globalFetch as any).mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer abc");
    globalFetch.mockRestore();
  });
});
