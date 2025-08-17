"use client";

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LandingPage() {
  const router = useRouter();

  return (
    <main className={styles.landing}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.logo}>LockedIn</h1>
        <button onClick={() => router.push("/login")} className={styles.loginButton}>
          Log In
        </button>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <h2 className={styles.title}>Your Ultimate Study Buddy</h2>
        <p className={styles.subtitle}>
          LockedIn helps you <strong>find study partners</strong>, 
          <strong> form groups</strong>, and <strong>track your progress</strong> — 
          so you stay motivated and succeed together.
        </p>
        <button
          className={styles.ctaButton}
          onClick={() => router.push("/signup")}
        >
          Get Started
        </button>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <h3>🤝 Find Partners</h3>
          <p>Connect with like-minded students to study smarter, not harder.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>📅 Plan Sessions</h3>
          <p>Organize group study sessions and never miss a deadline.</p>
        </div>
        <div className={styles.featureCard}>
          <h3>📊 Track Progress</h3>
          <p>Visualize your study habits and monitor your improvement.</p>
        </div>
      </section>
    </main>
  );
}
