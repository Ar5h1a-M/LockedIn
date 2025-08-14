"use client";

import React, { useState } from "react";
import {
  FaUserCircle,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaComments,
  FaThLarge,
} from "react-icons/fa";

import { useRouter } from "next/navigation"; /////to navigate to another page IMPORT

import styles from "./page.module.css";

const cards = [
  { id: "profiles", label: "User Profiles", icon: <FaUserCircle size={64} /> },
  {
    id: "search",
    label: "Study Partner Search",
    icon: <FaUsers size={64} />,
  },
  {
    id: "planner",
    label: "Group Session Planner",
    icon: <FaCalendarAlt size={64} />,
  },
  { id: "progress", label: "Progress Tracker", icon: <FaChartBar size={64} /> },
  { id: "chat", label: "Chat Functionality", icon: <FaComments size={64} /> },
  { id: "dashboard", label: "Dashboard", icon: <FaThLarge size={64} /> },
];

export default function Home() {
  const [dashboardActive, setDashboardActive] = useState(false);
  const router = useRouter(); /////to navigate to another page CREATE INSTANCE

  return (
    <main className={styles.container}>
      <section className={styles.gridContainer}>
        {cards.map(({ id, label, icon }) => {
          const isDashboard = id === "dashboard";
          const isActive = true ;//!isDashboard || dashboardActive;

          return (
            <div
              key={id}
              onClick={() => {
                if (isDashboard){
                  setDashboardActive(true);
                  router.push("/dashboard"); /////to navigate to another page MOVE TO PAGE
                } 
              }}
              className={`${styles.card} ${!isActive ? styles.cardInactive : ""}`}
              aria-disabled={!isActive}
              aria-label={label + (isActive ? "" : " (inactive)")}
              tabIndex={isActive ? 0 : -1}
            >
              <div className={styles.iconWrapper} aria-hidden="true">
                {icon}
              </div>
              <h2 className={styles.label}>{label}</h2>
              <div
                className={`${styles.accentLine} ${
                  !isActive ? styles.accentLineInactive : ""
                }`}
              />
            </div>
          );
        })}
      </section>
    </main>
  );
}
