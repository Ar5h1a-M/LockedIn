 
// Progress.tsx
"use client";

import { useState, useEffect } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import styles from "./page.module.css";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/Sidebar";

type Entry = { date: string; hours: number; productivity: number; notes?: string; };

export default function ProgressTracker() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(todayStr);
  const [hours, setHours] = useState<number | "">("");
  const [productivity, setProductivity] = useState(3);
  const [notes, setNotes] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const authHeaders = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

useEffect(() => {
  const fetchData = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL!;
    const headers = await authHeaders();
    if (!headers) return; // no session yet

    const resp = await fetch(`${API_URL}/api/progress`, { headers });
    if (resp.ok) {
      const j = await resp.json();
      setEntries(j.entries || []);
    }
  };

  // call immediately
  fetchData();

  // also refetch whenever session changes
  const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session) fetchData();
  });

  return () => sub.subscription.unsubscribe();
}, []);


  const handleLogHours = async () => {
    if (!hours && hours !== 0) return;
    const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
    const resp = await fetch(`${API_URL}/api/progress`, {
      method: "POST",
      headers,
      body: JSON.stringify({ date, hours: Number(hours), productivity, notes }),
    });
    const j = await resp.json();
    if (!resp.ok) return alert(j?.error || "Failed to save");

    const existingIndex = entries.findIndex(e => e.date === date);
    const newEntry = j.entry as Entry;
    let updated = [...entries];
    if (existingIndex >= 0) updated[existingIndex] = newEntry;
    else updated = [newEntry, ...entries].slice(0, 7);
    setEntries(updated);

    setHours("");
    setNotes("");
    setProductivity(3);
  };

  // … (the rest of your render unchanged)



  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
  const avgHours = entries.length ? (totalHours / entries.length).toFixed(1) : 0;

  // Dynamic motivational message based on today's hours
  const todayEntry = entries.find(e => e.date === date);
  let motivationMessage = "Start logging your study hours today!";
  if (todayEntry) {
    if (todayEntry.hours >= 4) motivationMessage = "Amazing work! Super productive today! 🎉";
    else if (todayEntry.hours >= 2) motivationMessage = "Great job! Keep the momentum going! 💪";
    else if (todayEntry.hours > 0) motivationMessage = "Good start! Every hour counts! 👍";
  }

  return (
    <div className="dashboardLayout">
                <Sidebar />
        <main className="dashboardContent ">
        <div className="dashboard-wrapper">
    {/* <main className={styles.container}> */}
      <header className={styles.header}>
        <h1>Progress Tracker</h1>
        <p>Log your study hours and track your progress over time.</p>
      </header>

      <section className={styles.grid}>
        {/* Left Column: Log + Motivation */}
        <div className={styles.leftColumn}>
          <div className={styles.card}>
            <h2>Log Study Hours</h2>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Hours studied"
              value={hours}
              onChange={e => setHours(e.target.value ? Number(e.target.value) : "")}
            />
            <label>
              Productivity: {productivity}/5
              <input
                type="range"
                min="0"
                max="5"
                value={productivity}
                onChange={e => setProductivity(Number(e.target.value))}
              />
            </label>
            <input
              type="text"
              placeholder="Optional notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <button onClick={handleLogHours}>Log Hours</button>
          </div>

          {entries.length > 0 && (
            <div className={styles.card}>
              <h2>Motivation</h2>
              <p className={styles.motivation}>{motivationMessage}</p>
            </div>
          )}
        </div>

        {/* Right Column: Summary + Chart */}
        <div className={styles.rightColumn}>
          <div className={styles.card}>
            <h2>Weekly Summary</h2>
            {entries.length === 0 ? (
              <p className={styles.placeholder}>
                No study hours logged yet. Start by adding today’s hours!
              </p>
            ) : (
              <>
                <ul className={styles.summaryList}>
                  {entries.map(entry => (
                    <li key={entry.date}>
                      <strong>{entry.date}</strong> → {entry.hours}h (Productivity: {entry.productivity}/5)
                      {entry.notes ? ` (${entry.notes})` : ""}
                    </li>
                  ))}
                </ul>

                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={[...entries].reverse()}
                    margin={{ top: 10, bottom: 10 }}
                  >
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#007acc" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="hours"
                      fill="url(#grad)"
                      radius={[6, 6, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>

                <p className={styles.total}>
                  This week: {totalHours} hours total, avg {avgHours}h/day
                </p>
              </>
            )}
          </div>
        </div>
      </section>
      </div>
    </main>
    </div>
  );
}


