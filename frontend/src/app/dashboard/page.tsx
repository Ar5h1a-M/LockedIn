// src/app/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { supabase } from "@/lib/supabaseClient";

type Group = { id: string; name?: string | null };
type Session = {
  id: string;
  group_id: string;
  creator_id: string;
  start_at: string;          // ISO
  venue: string | null;
  topic: string | null;
  time_goal_minutes: number | null;
  content_goal: string | null;
};

export default function DashboardPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const [studyTime] = useState({
    today: "2h 15m",
    week: "10h 40m",
    weekend: "4h 20m",
    month: "38h 10m",
  });

  const [upcomingTests] = useState([
    { subject: "Math", date: "2025-08-18" },
    { subject: "History", date: "2025-08-22" },
  ]);

  // --- NEW: groups & sessions pulled from API ---
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  // simple friends placeholder
  const [friends] = useState(["Alice", "Bob", "Charlie"]);

  // Helper to attach auth header
  const authHeaders = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  // Load groups (or fallback to localStorage if you don’t have an endpoint)
  const loadGroups = async () => {
    try {
      const headers = await authHeaders();
      // If you DON'T have /api/my/groups, comment the fetch below,
      // and use the localStorage fallback afterwards.
      const r = await fetch(`${API_URL}/api/my/groups`, { headers });
      if (r.ok) {
        const j = await r.json();
        const list: Group[] = j.groups || [];
        setGroups(list);
        if (!selectedGroupId) {
          const stored = typeof window !== "undefined" ? localStorage.getItem("currentGroupId") : null;
          setSelectedGroupId(stored || (list[0]?.id ?? null));
        }
        return;
      }
    } catch {
      /* ignore and try fallback */
    }

    // Fallback: if you store a current group id elsewhere in the app
    const stored = typeof window !== "undefined" ? localStorage.getItem("currentGroupId") : null;
    if (stored) {
      setGroups([{ id: stored, name: "Current Group" }]);
      if (!selectedGroupId) setSelectedGroupId(stored);
    }
  };

  const loadSessions = async (gid: string) => {
    setLoadingSessions(true);
    try {
      const headers = await authHeaders();
      const r = await fetch(`${API_URL}/api/groups/${gid}/sessions`, { headers });
      const j = await r.json();
      const list: Session[] = j.sessions || [];
      // Sort by soonest start time & keep next 8
      list.sort(
        (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
      );
      setSessions(list.slice(0, 8));
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      // keep selection in localStorage so dashboard remembers
      if (typeof window !== "undefined") {
        localStorage.setItem("currentGroupId", selectedGroupId);
      }
      loadSessions(selectedGroupId);
    } else {
      setSessions([]);
    }
  }, [selectedGroupId]);

  const selectedGroup = useMemo(
    () => groups.find(g => g.id === selectedGroupId) || null,
    [groups, selectedGroupId]
  );

  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboard-wrapper">
        <h1>📊 Student Dashboard</h1>

        {/* Study Time */}
        <section className="dashboard-section">
          <h2>Study Time</h2>
          <div className="study-time-grid">
            {Object.entries(studyTime).map(([label, value]) => (
              <div key={label} className="card">
                <span className="label">{label.toUpperCase()}</span>
                <span className="value">{value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Tests */}
        <section className="dashboard-section">
          <h2>Upcoming Tests</h2>
          {upcomingTests.length ? (
            <ul className="list">
              {upcomingTests.map((test, i) => (
                <li key={i} className="list-item">
                  <span>{test.subject}</span>
                  <span className="date">{test.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming tests 🎉</p>
          )}
        </section>

        {/* NEW: Upcoming Study Sessions from selected group */}
        <section className="dashboard-section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <h2>Upcoming Study Sessions</h2>

            {/* Group selector */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label htmlFor="groupSelect" style={{ fontSize: 14 }}>Group:</label>
              <select
                id="groupSelect"
                value={selectedGroupId ?? ""}
                onChange={(e) => setSelectedGroupId(e.target.value || null)}
                style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid #e5e7eb" }}
              >
                {groups.length === 0 && <option value="">—</option>}
                {groups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name || g.id}
                  </option>
                ))}
              </select>
              {selectedGroupId && (
                <Link
                  href={`/sessions/${selectedGroupId}`}
                  className="link"
                  style={{ fontSize: 14, textDecoration: "underline" }}
                >
                  Open sessions →
                </Link>
              )}
            </div>
          </div>

          {!selectedGroupId ? (
            <p>Select a group to view sessions.</p>
          ) : loadingSessions ? (
            <p>Loading sessions…</p>
          ) : sessions.length ? (
            <ul className="list">
              {sessions.map((s) => {
                const dt = new Date(s.start_at);
                const when = `${dt.toLocaleDateString()} at ${dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                return (
                  <li key={s.id} className="list-item">
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 600 }}>
                        {s.topic || "Study session"}
                      </span>
                      <span className="date">{when}</span>
                      <span style={{ fontSize: 12, color: "#64748b" }}>
                        Venue: {s.venue || "—"} · Time goal: {s.time_goal_minutes ? `${s.time_goal_minutes} min` : "—"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No upcoming study sessions 📚</p>
          )}
        </section>

        {/* Friends */}
        <section className="dashboard-section">
          <h2>Friends</h2>
          {friends.length ? (
            <ul className="friends-list">
              {friends.map((friend, i) => (
                <li key={i} className="friend-item">
                  {friend}
                </li>
              ))}
            </ul>
          ) : (
            <p>No friends yet 😢</p>
          )}
        </section>
      </main>
    </div>
  );
}
