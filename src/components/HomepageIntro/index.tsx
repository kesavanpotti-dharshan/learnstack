import React from "react";
import styles from "./styles.module.css";

const topics = [
  {
    emoji: "🧩",
    title: ".NET",
    desc: "C#, Clean Architecture, DDD/CQRS, and .NET internals.",
    link: "/dotnet",
  },
  {
    emoji: "☁️",
    title: "Azure",
    desc: "AKS, Service Bus, Functions, Entra ID, and cloud architecture notes.",
    link: "/azure",
  },
  {
    emoji: "⚛️",
    title: "React",
    desc: "React, TypeScript, hooks, and frontend patterns.",
    link: "/react",
  },
  {
    emoji: "🛠️",
    title: "DevOps",
    desc: "CI/CD, containers, Kubernetes, and infrastructure as code.",
    link: "/devops-lifecycle-roadmap",
  },
  {
    emoji: "🧮",
    title: "DSA",
    desc: "Data structures, algorithms, and problem-solving patterns.",
    link: "/dsa",
  },
  {
    emoji: "🏗️",
    title: "System Design",
    desc: "Scalability, distributed systems, and design trade-offs.",
    link: "/system-design",
  },
];

export default function HomepageIntro() {
  return (
    <>
      <div className={styles.hero}>
        <div className={styles.heroEmoji}>📚</div>
        <h1 className={styles.heroTitle}>Learnstack</h1>
        <p className={styles.heroText}>
          Personal learning notes across .NET, Azure, React, DevOps, and more —
          written to revisit before interviews and shared with fellow devs.
        </p>
      </div>

      <div className={styles.grid}>
        {topics.map((t) => (
          <a key={t.title} href={t.link} className={styles.card}>
            <div className={styles.cardEmoji}>{t.emoji}</div>
            <h3 className={styles.cardTitle}>{t.title}</h3>
            <p className={styles.cardDesc}>{t.desc}</p>
            <div className={styles.cardCta}>Explore →</div>
          </a>
        ))}
      </div>
    </>
  );
}
