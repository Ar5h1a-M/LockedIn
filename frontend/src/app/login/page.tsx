"use client";

import { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa"; // playfully simple icons
import { FcGoogle } from "react-icons/fc"; // Google icon
import Link from "next/link";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Add auth logic here
    alert("Login coming soon!");
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // TODO: Add Google OAuth logic here
    alert("Google Sign-in coming soon!");
    setIsLoading(false);
  };

  return (
    <main>
      <form onSubmit={handleLogin} aria-label="Login form">
        <h1>Welcome Back to LockedIn</h1>

        <button
          type="button"
          onClick={handleGoogleLogin}
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
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                aria-required="true"
              />
            </div>
          </label>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ marginTop: "1rem", textAlign: "center", fontStyle: "italic", color: "var(--muted)" }}>
          “Success is the sum of small efforts, repeated day in and day out.” – Robert Collier
        </p>

        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "var(--primary)", fontWeight: "600" }}>
            Sign up here
          </Link>
        </p>
      </form>
    </main>
  );
};

export default Login;
