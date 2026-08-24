"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Globe2,
  Search,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

type SourceItem = {
  name: string;
  type: string;
  language: string;
  category: string;
  status: string;
  url: string;
};

const sources: SourceItem[] = [
  {
    name: "Reuters",
    type: "News",
    language: "English",
    category: "International",
    status: "Active",
    url: "https://www.reuters.com/",
  },
  {
    name: "Bloomberg",
    type: "News",
    language: "English",
    category: "International",
    status: "Active",
    url: "https://www.bloomberg.com/",
  },
  {
    name: "Arab News",
    type: "News",
    language: "English",
    category: "Regional",
    status: "Active",
    url: "https://www.arabnews.com/",
  },
  {
    name: "Middle East Eye",
    type: "News",
    language: "English",
    category: "Regional",
    status: "Active",
    url: "https://www.middleeasteye.net/",
  },
  {
    name: "ReliefWeb",
    type: "Humanitarian",
    language: "English",
    category: "Humanitarian",
    status: "Pending API",
    url: "https://reliefweb.int/",
  },
  {
    name: "UN News",
    type: "Official",
    language: "English",
    category: "Humanitarian",
    status: "Active",
    url: "https://news.un.org/",
  },
  {
    name: "SABA",
    type: "Local News",
    language: "Arabic",
    category: "Local",
    status: "Active",
    url: "https://www.saba.ye/",
  },
  {
    name: "Saba News",
    type: "Local News",
    language: "English",
    category: "Local",
    status: "Active",
    url: "https://www.sabanew.net/",
  },
  {
    name: "The Maritime Executive",
    type: "Maritime",
    language: "English",
    category: "Maritime",
    status: "Active",
    url: "https://www.maritime-executive.com/",
  },
  {
    name: "gCaptain",
    type: "Maritime",
    language: "English",
    category: "Maritime",
    status: "Active",
    url: "https://gcaptain.com/",
  },
  {
    name: "Marine Log",
    type: "Maritime",
    language: "English",
    category: "Maritime",
    status: "Active",
    url: "https://www.marinelog.com/",
  },
  {
    name: "X",
    type: "Social",
    language: "English + Arabic",
    category: "Social",
    status: "Planned",
    url: "https://x.com/",
  },
  {
    name: "Reddit",
    type: "Social",
    language: "English",
    category: "Social",
    status: "Planned",
    url: "https://www.reddit.com/",
  },
  {
    name: "Facebook",
    type: "Social",
    language: "English + Arabic",
    category: "Social",
    status: "Planned",
    url: "https://www.facebook.com/",
  },
  {
    name: "Instagram",
    type: "Social",
    language: "English + Arabic",
    category: "Social",
    status: "Planned",
    url: "https://www.instagram.com/",
  },
  {
    name: "YouTube",
    type: "Social",
    language: "English + Arabic",
    category: "Social",
    status: "Planned",
    url: "https://www.youtube.com/",
  },
  {
    name: "Telegram",
    type: "Social",
    language: "English + Arabic",
    category: "Social",
    status: "Planned",
    url: "https://telegram.org/",
  },
  {
    name: "Bluesky",
    type: "Social",
    language: "English",
    category: "Social",
    status: "Planned",
    url: "https://bsky.app/",
  },
  {
    name: "Truth Social",
    type: "Social",
    language: "English",
    category: "Social",
    status: "Planned",
    url: "https://truthsocial.com/",
  },
  {
    name: "Substack",
    type: "Social / Newsletter",
    language: "English",
    category: "Social",
    status: "Planned",
    url: "https://substack.com/",
  },
  {
    name: "Mastodon",
    type: "Social",
    language: "Multiple",
    category: "Social",
    status: "Planned",
    url: "https://joinmastodon.org/",
  },
];

const categories = [
  "All",
  "International",
  "Regional",
  "Local",
  "Maritime",
  "Humanitarian",
  "Social",
];

export default function SourcesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState("All");

  const filtered = useMemo(() => {
    const query = search
      .toLowerCase()
      .trim();

    return sources.filter((source) => {
      const matchesCategory =
        activeCategory === "All" ||
        source.category === activeCategory;

      const matchesSearch =
        !query ||
        source.name
          .toLowerCase()
          .includes(query) ||
        source.type
          .toLowerCase()
          .includes(query) ||
        source.language
          .toLowerCase()
          .includes(query) ||
        source.status
          .toLowerCase()
          .includes(query);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [search, activeCategory]);

  return (
    <main>
      <header className="topbar">
        <div className="brandWrap">
          <Image
            src="/brand/basha-report-logo.png"
            alt="Basha Report"
            width={110}
            height={104}
            className="brandLogo"
            priority
          />

          <div className="brandDivider" />

          <div>
            <div className="productName">
              Yemen Monitor
            </div>

            <div className="productSub">
              Basha Report Intelligence
            </div>
          </div>
        </div>
      </header>

      <section className="sourcesPage">
        <Link
          href="/"
          className="backLink"
        >
          <ArrowLeft size={16} />
          Back to overview
        </Link>

        <div className="sourcesHeading">
          <div>
            <div className="eyebrow">
              SOURCE DIRECTORY
            </div>

            <h1>Sources</h1>

            <p>
              News, humanitarian, maritime,
              official and social sources monitored
              by Yemen Monitor.
            </p>
          </div>

          <div className="feedSearch">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search sources"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div className="categoryFilters sourceFilters">
          {categories.map((category) => (
            <button
              key={category}
              className={
                activeCategory === category
                  ? "categoryButton activeCategoryButton"
                  : "categoryButton"
              }
              onClick={() =>
                setActiveCategory(category)
              }
            >
              {category}

              <span>
                {category === "All"
                  ? sources.length
                  : sources.filter(
                      (source) =>
                        source.category ===
                        category
                    ).length}
              </span>
            </button>
          ))}
        </div>

        <div className="sourcesGrid">
          {filtered.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="sourceCard"
            >
              <div className="sourceCardTop">
                <div className="sourceIcon">
                  <Globe2 size={18} />
                </div>

                <span
                  className={
                    source.status === "Active"
                      ? "sourceStatus activeSource"
                      : source.status === "Pending API"
                      ? "sourceStatus pendingSource"
                      : "sourceStatus plannedSource"
                  }
                >
                  {source.status}
                </span>
              </div>

              <h2>{source.name}</h2>

              <div className="sourceDetails">
                <span>
                  {source.type}
                </span>

                <span>
                  {source.language}
                </span>

                <span>
                  {source.category}
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
