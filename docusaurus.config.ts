import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Learnstack",
  tagline:
    "My learning notes & interview prep — .NET, Azure, React, DevOps and beyond",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://learnstack.vercel.app", // update once custom domain is live
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: "/",

  organizationName: "kesavanpotti-dharshan", // Usually your GitHub org/user name.
  projectName: "learnstack", // Usually your repo name.

  onBrokenLinks: "throw",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Karla:wght@400;500;600&family=Mulish:wght@600;700;800&display=swap",
      },
    },
  ],

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/kesavanpotti-dharshan/learnstack/tree/main/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          editUrl:
            "https://github.com/kesavanpotti-dharshan/learnstack/tree/main/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/social-card.png",
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: "Learnstack",
      logo: {
        alt: "Learnstack Logo",
        src: "img/logo.svg",
      },
      items: [
        { to: "/docs/", label: "Notes", position: "left" },
        { to: "/blog/", label: "Blog", position: "left" },
        {
          href: "https://github.com/kesavanpotti-dharshan/learnstack",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Links",
          items: [
            { label: "Notes", to: "/docs/intro" },
            { label: "Blog", to: "/blog" },
            {
              label: "GitHub",
              href: "https://github.com/kesavanpotti-dharshan/learnstack",
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Dharshan — Learnstack`,
    },
    prism: {
      theme: prismThemes.oneLight,
      darkTheme: prismThemes.oneDark,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
