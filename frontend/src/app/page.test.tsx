import { render, screen, fireEvent } from "@testing-library/react";
import LandingPage from "./page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("LandingPage", () => {
  it("renders hero and CTA buttons", () => {
    (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    render(<LandingPage />);
    expect(screen.getByRole("heading", { name: /^LockedIn$/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Get Started/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Find Partners/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Plan Sessions/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Track Progress/i })).toBeInTheDocument();
  });

  it("navigates to login on Log In click", () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });
    render(<LandingPage />);
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));
    expect(push).toHaveBeenCalledWith("/login");
  });

  it("navigates to signup on Get Started click", () => {
    const push = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push });
    render(<LandingPage />);
    fireEvent.click(screen.getByRole("button", { name: /Get Started/i }));
    expect(push).toHaveBeenCalledWith("/signup");
  });
});
