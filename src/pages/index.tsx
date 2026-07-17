import type { ReactNode } from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import Heading from "@theme/Heading";

import styles from "./index.module.css";

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("hero", styles.heroBanner)}>
      <div className="container">
        <p className={styles.eyebrow}>Personal knowledge base</p>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/">
            Browse the notes →
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="https://github.com/kesavanpotti-dharshan/learnstack"
          >
            View on GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

type Topic = {
  title: string;
  emoji: string;
  description: string;
  to: string;
};

const topics: Topic[] = [
  {
    title: ".NET",
    emoji: "🧩",
    description: "C#, ASP.NET Core, Clean Architecture, CQRS, EF Core.",
    to: "/docs/category/dotnet",
  },
  {
    title: "Azure",
    emoji: "☁️",
    description: "AKS, Service Bus, Functions, Entra ID, cloud patterns.",
    to: "/docs/category/azure",
  },
  {
    title: "React",
    emoji: "⚛️",
    description: "Hooks, state management, TypeScript, performance.",
    to: "/docs/category/react",
  },
  {
    title: "DevOps",
    emoji: "⚙️",
    description: "CI/CD pipelines, Docker, observability, deployment.",
    to: "/docs/category/devops",
  },
  {
    title: "DSA",
    emoji: "🧠",
    description: "Data structures, algorithms, problem-solving patterns.",
    to: "/docs/category/dsa",
  },
  {
    title: "System Design",
    emoji: "🏗️",
    description: "Scalability, microservices, distributed systems.",
    to: "/docs/category/system-design",
  },
  {
    title: "Databases",
    emoji: "🗄️",
    description: "Notes on database concepts and technologies.",
    to: "/docs/category/databases",
  },
];

function TopicGrid() {
  return (
    <section className={styles.topicSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Explore by topic
        </Heading>
        <div className={styles.grid}>
          {topics.map((topic) => (
            <Link key={topic.title} to={topic.to} className={styles.card}>
              <span className={styles.cardEmoji}>{topic.emoji}</span>
              <Heading as="h3" className={styles.cardTitle}>
                {topic.title}
              </Heading>
              <p className={styles.cardDescription}>{topic.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Personal learning notes across .NET, Azure, React, DevOps, DSA and System Design — built for interview prep and knowledge sharing."
    >
      <HomepageHeader />
      <main>
        <TopicGrid />
      </main>
    </Layout>
  );
}
