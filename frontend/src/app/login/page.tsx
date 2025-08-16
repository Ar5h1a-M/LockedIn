"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  // After redirect back from Google, verify with backend and go to dashboard
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const access_token = data?.session?.access_token;
      if (!access_token) return; // not logged in

      try {
        await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({}), // token is in header
        });
        router.push("/dashboard");
      } catch (e) {
        console.error("Backend verify failed:", e);
      }
    })();
  }, [API_URL, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // get token then verify with backend
      const { data } = await supabase.auth.getSession();
      const access_token = data?.session?.access_token;
      if (access_token) {
        await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });
      }
      router.push("/dashboard");
    } catch (err:unknown ) {
      console.error(err);
      if (err instanceof Error) {
        alert(err.message ?? "Sign-in failed");
      } else {
        alert("Sign-in failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: siteUrl },
      });
      if (error) throw error;
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        alert(err.message ?? "Google sign-in failed");
      } else {
        alert("Google sign-in failed");
      }

      setIsLoading(false);
    }
  };


  return (
    <main>
      <form onSubmit={handleLogin} aria-label="Login form">
        <h1>Welcome Back to LockedIn</h1>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}
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
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Sign up here
          </Link>
        </p>
      </form>
    </main>
  );
}
