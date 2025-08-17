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

  // Frontend envs
  const siteUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

  // After Google redirects back to /login, verify with backend BEFORE redirecting
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const access_token = data?.session?.access_token;
      if (!access_token || !API_URL) return;

      try {
        const resp = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({}),
        });

        if (resp.ok) {
          router.push("/dashboard");
        } else {
          const j = await resp.json().catch(() => ({}));
          alert(j?.error || "Not authorized for this app");
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error("Backend verify failed:", e);
        alert("Login verification failed");
        await supabase.auth.signOut();
      }
    })();
  }, [API_URL, router]);

  // Keep UI the same, but disable manual login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Email/password login is disabled. Please use Google.");
    await handleGoogleLogin();
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${siteUrl}/login` },
      });
      if (error) throw error; // browser will redirect
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Google sign-in failed");
      setIsLoading(false);
    }
  };

  return (
    <main>
      <form onSubmit={handleLogin} aria-label="Login form">
        <h1>Welcome back</h1>

        <button type="button" onClick={handleGoogleLogin} disabled={isLoading}>
          <FcGoogle size={24} />
          Continue with Google
        </button>

        <div style={{ marginTop: "1rem" }}>
          <label htmlFor="email">
            Email
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaEnvelope />
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
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
