"use client";

import { useEffect, useState } from "react";
import { FaSearch, FaInbox, FaBell } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  full_name: string;
  degree?: string;
  modules?: string[];
  interest?: string;
};

type Invitation = {
  id: string;
  recipient_name?: string;
  sender_name?: string;
  status: string;
};

export default function SearchPage() {
  const [searchType, setSearchType] = useState<"modules" | "degree" | "interest">("modules");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [sentInvites, setSentInvites] = useState<Invitation[]>([]);
  const [receivedInvites, setReceivedInvites] = useState<Invitation[]>([]);
  const [showInbox, setShowInbox] = useState(false);
  const [showBell, setShowBell] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

  // Fetch search results as user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      try {
        const resp = await fetch(`${API_URL}/api/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ searchTerm: query.trim(), searchType }),
        });

        const json = await resp.json();
        setResults(json?.profiles?.slice(0, 15) || []);
      } catch (e) {
        console.error("Search error", e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query, searchType]);

  // Fetch inbox + notifications
  const fetchInvitations = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return;

    try {
      const [sentResp, recvResp] = await Promise.all([
        fetch(`${API_URL}/api/invitations/sent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/invitations/received`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const sent = await sentResp.json();
      const recv = await recvResp.json();

      setSentInvites(sent?.invitations || []);
      setReceivedInvites(recv?.invitations || []);
    } catch (e) {
      console.error("Error fetching invitations:", e);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleInvite = async (recipientId: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    try {
      const resp = await fetch(`${API_URL}/api/invitations/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipientId }),
      });

      const j = await resp.json();
      if (resp.ok) {
        alert("Invitation sent!");
        fetchInvitations();
      } else {
        alert(j?.error || "Failed to send invite");
      }
    } catch (e) {
      console.error("Invite error", e);
    }
  };

  const handleRespond = async (invitationId: string, status: "accepted" | "declined") => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    try {
      const resp = await fetch(`${API_URL}/api/invitations/respond/${invitationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const j = await resp.json();
      if (resp.ok) {
        alert(`Invitation ${status}`);
        fetchInvitations();
      } else {
        alert(j?.error || "Failed to respond");
      }
    } catch (e) {
      console.error("Response error", e);
    }
  };

  return (
    <main className="dashboard-wrapper">
      <header className="dashboard-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🤝 Study Partner Search</h1>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => { setShowInbox(!showInbox); setShowBell(false); }}>
            <FaInbox size={22} />
          </button>
          <button onClick={() => { setShowBell(!showBell); setShowInbox(false); }}>
            <FaBell size={22} />
          </button>
        </div>
      </header>

      {/* Search Type Buttons */}
      <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
        {["modules", "degree", "interest"].map((type) => (
          <button
            key={type}
            onClick={() => setSearchType(type as any)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: searchType === type ? "var(--primary)" : "var(--muted)",
              color: "white",
              borderRadius: "0.5rem",
              border: "none",
            }}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <FaSearch />
        <input
          type="text"
          placeholder={`Search by ${searchType}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #ccc" }}
        />
      </div>

      {/* Results */}
      <section className="dashboard-section" style={{ marginTop: "2rem" }}>
        <h2>Results</h2>
        {isLoading ? <p>Loading...</p> : results.length === 0 ? <p>No results</p> : (
          <ul className="list">
            {results.map((p) => (
              <li key={p.id} className="list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{p.full_name}</strong><br />
                  <small>
                    {searchType === "degree" && p.degree}
                    {searchType === "interest" && p.interest}
                    {searchType === "modules" && p.modules?.join(", ")}
                  </small>
                </div>
                <button onClick={() => handleInvite(p.id)}>Invite</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Inbox Panel */}
      {showInbox && (
        <section className="dashboard-section">
          <h2>📩 Sent Invitations</h2>
          {sentInvites.length ? (
            <ul className="list">
              {sentInvites.map((inv) => (
                <li key={inv.id} className="list-item">
                  To: {inv.recipient_name} — Status: {inv.status}
                </li>
              ))}
            </ul>
          ) : <p>No invitations sent yet.</p>}
        </section>
      )}

      {/* Bell Panel */}
      {showBell && (
        <section className="dashboard-section">
          <h2>🔔 Received Invitations</h2>
          {receivedInvites.length ? (
            <ul className="list">
              {receivedInvites.map((inv) => (
                <li key={inv.id} className="list-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>From: {inv.sender_name} — Status: {inv.status}</div>
                  {inv.status === "pending" && (
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button onClick={() => handleRespond(inv.id, "accepted")}>Accept</button>
                      <button onClick={() => handleRespond(inv.id, "declined")}>Decline</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : <p>No invitations received yet.</p>}
        </section>
      )}
    </main>
  );
}
