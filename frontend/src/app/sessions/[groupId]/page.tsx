// app/sessions/[groupId]/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Session = {
  id: string;
  group_id: string;
  start_at: string;
  venue: string | null;
  topic: string | null;
  time_goal_minutes: number | null;
  content_goal: string | null;
};

type ChatMessage = {
  id: number;
  group_id: string;
  session_id: string | null;
  sender_id: string;
  content: string | null;
  attachment_url: string | null;
  created_at: string;
};

export default function GroupSessionsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const { groupId } = useParams<{ groupId: string }>();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [startAt, setStartAt] = useState<string>(""); // yyyy-mm-ddThh:mm (local)
  const [venue, setVenue] = useState("");
  const [topic, setTopic] = useState("");
  const [timeGoal, setTimeGoal] = useState<number | "">("");
  const [contentGoal, setContentGoal] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const authHeaders = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const loadSessions = async () => {
    const headers = await authHeaders();
    const r = await fetch(`${API_URL}/api/groups/${groupId}/sessions`, { headers });
    const j = await r.json();
    setSessions(j.sessions || []);
  };

  const loadMessages = async () => {
    const headers = await authHeaders();
    const r = await fetch(`${API_URL}/api/groups/${groupId}/messages?limit=200`, { headers });
    const j = await r.json();
    setMessages(j.messages || []);
    // auto-scroll to bottom
    setTimeout(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight }), 0);
  };

  useEffect(() => {
    loadSessions();
    loadMessages();
    const t = setInterval(loadMessages, 2000);
    return () => clearInterval(t);
  }, [groupId]);

  const createSession = async () => {
    if (!startAt) return alert("Please pick a date and time");
    const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
    const r = await fetch(`${API_URL}/api/groups/${groupId}/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        start_at: new Date(startAt).toISOString(),
        venue: venue || null,
        topic: topic || null,
        time_goal_minutes: timeGoal === "" ? null : Number(timeGoal),
        content_goal: contentGoal || null,
      }),
    });
    const j = await r.json();
    if (!r.ok) return alert(j?.error || "Failed");
    setStartAt(""); setVenue(""); setTopic(""); setTimeGoal(""); setContentGoal("");
    loadSessions();
  };

  const sendMessage = async () => {
    if (!message && !file) return;
    setSending(true);
    try {
      let attachment_url: string | null = null;

      if (file) {
        const { data: userData } = await supabase.auth.getUser();
        const uid = userData.user?.id!;
        const path = `${groupId}/${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from("group-uploads")
          .upload(path, file, { upsert: false });
        if (error) throw error;

        const { data: urlData } = supabase.storage.from("group-uploads").getPublicUrl(path);
        attachment_url = urlData.publicUrl;
      }

      const headers = { "Content-Type": "application/json", ...(await authHeaders()) };
      const r = await fetch(`${API_URL}/api/groups/${groupId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          session_id: null, // or bind to a selected session id if you add that UI later
          content: message || null,
          attachment_url,
        }),
      });
      const j = await r.json();
      if (!r.ok) return alert(j?.error || "Send failed");
      setMessage("");
      setFile(null);
      await loadMessages();
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    } catch (e:any) {
      alert(e.message || "Upload/send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="dashboard-wrapper">
      <header className="dashboard-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h1>📅 Group Sessions</h1>
      </header>

      {/* Planner */}
      <section className="dashboard-section" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <div className="card">
          <h2>Plan a Study Session</h2>
          <label>Date & time</label>
          <input type="datetime-local" value={startAt} onChange={e => setStartAt(e.target.value)} />
          <label>Venue</label>
          <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g., Library Room 3" />
          <label>What will we study?</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., Linear Algebra Ch. 4" />
          <label>Study time goal (minutes)</label>
          <input type="number" min="0" value={timeGoal} onChange={e => setTimeGoal(e.target.value === "" ? "" : Number(e.target.value))} />
          <label>Content goal</label>
          <input value={contentGoal} onChange={e => setContentGoal(e.target.value)} placeholder="e.g., Finish problem set Q1–Q5" />
          <button onClick={createSession}>Create session</button>
        </div>

        <div className="card">
          <h2>Upcoming Sessions</h2>
          {!sessions.length ? <p>No sessions yet.</p> : (
            <ul className="list" style={{ maxHeight: 260, overflow: "auto" }}>
              {sessions.map(s => (
                <li key={s.id} className="list-item">
                  <strong>{new Date(s.start_at).toLocaleString()}</strong>
                  <div><small>Venue: {s.venue || "—"}</small></div>
                  <div><small>Topic: {s.topic || "—"}</small></div>
                  <div><small>Time goal: {s.time_goal_minutes ? `${s.time_goal_minutes} min` : "—"}</small></div>
                  <div><small>Content goal: {s.content_goal || "—"}</small></div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Chat */}
      <section className="dashboard-section" style={{ marginTop:16, display:"grid", gridTemplateColumns:"1fr", gap:16 }}>
        <div className="card">
          <h2>Group Chat</h2>
          <div ref={listRef} style={{ height: 280, overflow: "auto", border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
            {messages.map(m => (
              <div key={m.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{new Date(m.created_at).toLocaleString()}</div>
                {m.content && <div>{m.content}</div>}
                {m.attachment_url && <div><a href={m.attachment_url} target="_blank" rel="noreferrer">📎 Attachment</a></div>}
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:8, marginTop:8, alignItems:"flex-end" }}>
            <textarea
              style={{ flex:1, minHeight: 80, resize: "vertical", padding: 10 }}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write a message… (Shift+Enter for newline)"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
            <button onClick={sendMessage} disabled={sending}>
              {sending ? "Sending…" : "Send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}