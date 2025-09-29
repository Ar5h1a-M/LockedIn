import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "./page";

const pushSpy = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushSpy, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/",
}));

describe("Menu Page", () => {
  beforeEach(() => pushSpy.mockReset());

  it("renders main cards and navigates on click", async () => {
    render(<Page />);

    const user = userEvent.setup();

    // Find common menu items by text
    const dashboard = screen.getByRole("button", { name: /dashboard/i });
    const partnerFinder = screen.getByRole("button", { name: /partner finder/i });
    const groups = screen.getByRole("button", { name: /groups/i });
    const progress = screen.getByRole("button", { name: /progress/i });
    const profiles = screen.getByRole("button", { name: /profile/i });

    await user.click(dashboard);
    expect(pushSpy).toHaveBeenCalledWith("/dashboard");

    await user.click(partnerFinder);
    expect(pushSpy).toHaveBeenCalledWith("/search");

    await user.click(groups);
    expect(pushSpy).toHaveBeenCalledWith("/groups");

    await user.click(progress);
    expect(pushSpy).toHaveBeenCalledWith("/progress_tracker");

    await user.click(profiles);
    expect(pushSpy).toHaveBeenCalledWith("/user_profiles");
  });
});
