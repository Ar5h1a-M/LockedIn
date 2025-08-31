"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
//import styles from "./page.module.css";



export default function DashboardPage() {
  const [studyTime, setStudyTime] = useState({
    today: "2h 15m",
    week: "10h 40m",
    weekend: "4h 20m",
    month: "38h 10m",
  });

  const [upcomingTests, setUpcomingTests] = useState([
    { subject: "Math", date: "2025-08-18" },
    { subject: "History", date: "2025-08-22" },
  ]);

  const [studySessions, setStudySessions] = useState([
    { topic: "Biology - Photosynthesis", date: "2025-08-16", time: "15:00" },
    { topic: "Physics - Mechanics", date: "2025-08-17", time: "10:00" },
  ]);

  const [friends, setFriends] = useState(["Alice", "Bob", "Charlie"]);

  useEffect(() => {
    // TODO: Replace with actual API calls
  }, []);

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

      {/* Upcoming Study Sessions */}
      <section className="dashboard-section">
        <h2>Upcoming Study Sessions</h2>
        {studySessions.length ? (
          <ul className="list">
            {studySessions.map((session, i) => (
              <li key={i} className="list-item">
                <span>{session.topic}</span>
                <span className="date">
                  {session.date} at {session.time}
                </span>
              </li>
            ))}
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


