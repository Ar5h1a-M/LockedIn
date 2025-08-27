

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaGraduationCap, FaBook, FaLightbulb, FaPlus, FaMinus } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";

// Helper: load options from txt files
async function fetchOptions(file: string): Promise<string[]> {
  try {
    const resp = await fetch(`/data/${file}`);
    const text = await resp.text();
    return text.split("\n").map((line) => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export default function SignUp() {
  const router = useRouter();
  const [degrees, setDegrees] = useState<string[]>([]);
  const [modules, setModules] = useState<string[]>([]);

  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [interest, setInterest] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const siteUrl =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

  // Load dropdown data
  useEffect(() => {
    fetchOptions("degrees.txt").then(setDegrees);
    fetchOptions("modules.txt").then(setModules);
  }, []);

  // After Google redirect back to /signup → call backend to create profile
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const access_token = data?.session?.access_token;
      if (!access_token || !API_URL) return;

      // Only proceed if user has selected info
      if (!selectedDegree || selectedModules.length === 0 || !interest) return;

      const filteredModules = selectedModules.filter(m => m.trim() !== "");
      if (filteredModules.length === 0) return;

      try {
        const resp = await fetch(`${API_URL}/api/auth/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
          },
          body: JSON.stringify({
            degree: selectedDegree,
            modules: filteredModules,
            interest,
          }),
        });

        if (resp.ok) {
          router.push("/menu");
        } else {
          const j = await resp.json().catch(() => ({}));
          alert(j?.error || `Signup failed (Status: ${resp.status})`);
          await supabase.auth.signOut();
        }
      } catch (e) {
        console.error("Signup failed:", e);
        alert("Signup failed");
        await supabase.auth.signOut();
      }
    })();
  }, [API_URL, router, selectedDegree, selectedModules, interest]);

  // Handle “Complete Signup” → validate fields then start Google OAuth
  const handleCompleteSignup = async () => {
    if (!selectedDegree) {
      alert("Please select a degree.");
      return;
    }
    const filteredModules = selectedModules.filter(m => m.trim() !== "");
    if (filteredModules.length === 0) {
      alert("Please select at least one module.");
      return;
    }
    if (!interest.trim()) {
      alert("Please enter your study interest.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${siteUrl}/signup` },
      });
      if (error) throw error;
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Google sign-in failed");
      setIsLoading(false);
    }
  };

  // Module management
  const addModule = () => setSelectedModules(prev => [...prev, ""]);
  const removeModule = (index: number) => setSelectedModules(prev => prev.filter((_, i) => i !== index));
  const updateModule = (index: number, value: string) =>
    setSelectedModules(prev => prev.map((m, i) => i === index ? value : m));
  const getAvailableModules = (currentIndex: number) => {
    const selectedValues = selectedModules.filter((m, i) => i !== currentIndex && m.trim() !== "");
    return modules.filter(m => !selectedValues.includes(m));
  };

  return (
    <main>
      <form onSubmit={(e) => e.preventDefault()} aria-label="Sign up form">
        <h1>Create Your LockedIn Account</h1>

        {/* Degree dropdown */}
        <div>
          <label htmlFor="degree">
            Degree
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaGraduationCap />
              <select
                id="degree"
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value)}
              >
                <option value="">-- Select your degree --</option>
                {degrees.map((deg) => (
                  <option key={deg} value={deg}>{deg}</option>
                ))}
              </select>
            </div>
          </label>
        </div>

        {/* Modules dropdowns */}
        <div>
          <label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <FaBook />
              <span>Modules</span>
              <button
                type="button"
                onClick={addModule}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.875rem",
                  backgroundColor: "var(--primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                <FaPlus size={12} /> Add Module
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {selectedModules.map((selectedModule, index) => (
                <div key={index} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <select
                    value={selectedModule}
                    onChange={(e) => updateModule(index, e.target.value)}
                    style={{ flex: 1 }}
                  >
                    <option value="">-- Select a module --</option>
                    {getAvailableModules(index).map(mod => (
                      <option key={mod} value={mod}>{mod}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeModule(index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "32px",
                      height: "32px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                    title="Remove module"
                  >
                    <FaMinus size={12} />
                  </button>
                </div>
              ))}
            </div>
          </label>
        </div>

        {/* Interest */}
        <div>
          <label htmlFor="interest">
            Study Interest
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <FaLightbulb />
              <input
                type="text"
                id="interest"
                placeholder="e.g. AI, data science"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
              />
            </div>
          </label>
        </div>

        {/* Complete Signup Button */}
        <button
          type="button"
          onClick={handleCompleteSignup}
          disabled={isLoading}
          style={{
            marginTop: "1.5rem",
            width: "100%",
            padding: "0.75rem",
            backgroundColor: "var(--primary)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Complete Signup
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
