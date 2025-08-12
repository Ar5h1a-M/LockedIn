"use client";

import { useState } from "react";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    // TODO: Implement sign-up logic here (e.g., API call)
    alert("Sign-up coming soon!");
    setIsLoading(false);
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    // TODO: Implement Google OAuth logic here
    alert("Google Sign-up coming soon!");
    setIsLoading(false);
  };

  return (
    <main>
      <form onSubmit={handleSignUp} aria-label="Sign up form">
        <h1>Create Your LockedIn Account</h1>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <div>
          <label htmlFor="fullName">
            Full Name
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaUser />
              <input
                type="text"
                id="fullName"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                aria-required="true"
              />
            </div>
          </label>
        </div>

        <div>
          <label htmlFor="email">
            Email address
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaEnvelope />
              <input
                type="email"
                id="email"
                placeholder="your.email@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-required="true"
              />
            </div>
          </label>
        </div>

        <div>
          <label htmlFor="password">
            Password
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaLock />
              <input
                type="password"
                id="password"
                placeholder="Enter a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
                minLength={6}
              />
            </div>
          </label>
        </div>

        <div>
          <label htmlFor="confirmPassword">
            Confirm Password
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaLock />
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                aria-required="true"
                minLength={6}
              />
            </div>
          </label>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Sign Up"}
        </button>

        <p style={{ marginTop: "1rem", textAlign: "center", fontStyle: "italic", color: "var(--muted)" }}>
          “The future belongs to those who learn more skills and combine them creatively.” – Robert Greene
        </p>

        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: "600" }}>
            Sign in here
          </Link>
        </p>
      </form>
    </main>
  );
};

export default SignUp;
