"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { supabase } from "@/lib/supabaseClient";

export default function SignUp() {
  const router = useRouter();

  // Keep fields so the UI looks identical, but we won't use them (Google-only)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const siteUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

  // After Google redirects back to /signup, verify with backend
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const access_token = data?.session?.access_token;
      if (!access_token || !API_URL) return;

      try {
        const resp = await fetch(`${API_URL}/api/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
        });

        if (resp.ok) {
          // Signup successful - redirect to menu
          router.push("/menu");
        } else {
          const j = await resp.json().catch(() => ({}));
          alert(j?.error || "Signup failed");
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error("Backend verify failed:", e);
        alert("Signup verification failed");
        await supabase.auth.signOut();
      }
    })();
  }, [API_URL, router]);

  // Disable manual sign up; route to Google instead
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    alert("Email/password sign-up is disabled. Please continue with Google.");
    await handleGoogleSignUp();
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${siteUrl}/signup` }, // will land on /signup to be verified by backend
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
      <form onSubmit={handleSignUp} aria-label="Sign up form">
        <h1>Create Your LockedIn Account</h1>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isLoading}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1.5rem" }}
        >
          <FcGoogle size={24} />
          Continue with Google
        </button>

        {/* The fields remain for layout parity only */}
        <div>
          <label htmlFor="fullName">
            Full Name
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaUser />
              <input
                type="text"
                id="fullName"
                placeholder="Enter your full name"
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
                placeholder="Create a password"
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
          &ldquo;The future belongs to those who learn more skills and combine them creatively.&rdquo; — Robert Greene
        </p>

        <p style={{ textAlign: "center", marginTop: "1.5rem" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--primary)", fontWeight: 600 }}>
            Sign in here
          </Link>
        </p>
      </form>
    </main>
  );
}