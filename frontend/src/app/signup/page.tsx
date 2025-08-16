"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const SignUp = () => {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);
    
    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Insert user data into your users table
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              full_name: fullName,
            }
          ]);

        if (insertError) {
          console.error('Error inserting user data:', insertError);
          // Don't throw here as the auth signup was successful
        }

        alert("Account created successfully! Please check your email for verification.");
        router.push("/login");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes('User already registered')) {
        alert("An account with this email already exists. Please sign in instead.");
      } else {
        alert(err.message ?? "Sign-up failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: siteUrl,
        },
      });
      if (error) throw error;
      // Will redirect; no need to unset loading here.
    } catch (err: any) {
      console.error(err);
      alert(err.message ?? "Google sign-up failed");
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
