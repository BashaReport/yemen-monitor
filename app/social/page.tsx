"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CircleAlert,
  Filter,
  Search,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

type SocialItem = {
  id: number;
  platform: string;
  account: string;
  handle: string;
  language: string;
  status: string;
  topic: string;
  text: string;
  url: string;
};

const socialItems: SocialItem[] = [
  {
    id: 1,
    platform: "X",
    account: "Example Yemen Source",
    handle: "@example",
    language: "English",
    status: "Planned",
    topic: "Security",
    text: "X monitoring will appear here once API access is connected.",
    url: "https://x.com/",
  },
  {
    id: 2,
    platform: "Reddit",
    account: "Yemen discussions",
    handle: "r/Yemen",
    language: "English",
    status: "Planned",
    topic: "General",
    text: "Public Reddit discussions related to Yemen will appear here.",
    url: "https://www.reddit.com/",
  },
  {
    id: 3,
    platform: "Bluesky",
    account: "Yemen keyword monitor",
    handle: "Bluesky",
    language: "English",
    status: "Planned",
    topic: "General",
    text: "Public Bluesky posts matching Yemen-related terms will appear here.",
    url: "https://bsky.app/",
  },
  {
    id: 4,
    platform: "YouTube",
    account: "Yemen video monitor",
    handle: "YouTube",
    language: "English + Arabic",
    status: "Planned",
    topic: "Media",
    text: "Recent Yemen-related videos and official channel uploads will appear here.",
    url: "https://www.youtube.com/",
  },
  {
    id: 5,
    platform: "Telegram",
    account: "Public channel monitor",
    handle: "Telegram",
    language: "English + Arabic",
    status: "Planned",
    topic: "Security",
    text: "Approved public Telegram channels can be monitored here later.",
    url: "https://telegram.org/",
  },
  {
    id: 6,
    platform: "Facebook",
    account: "Public page monitor",
    handle: "Facebook",
    language: "English + Arabic",
    status: "Planned",
    topic: "General",
    text: "Public Facebook pages and approved integrations will appear here.",
    url: "https://www.facebook.com/",
  },
  {
    id: 7,
    platform: "Instagram",
    account: "Public account monitor",
    handle: "Instagram",
    language: "English + Arabic",
    status: "Planned",
    topic: "Media",
    text: "Public Instagram posts can be added when approved access is available.",
    url: "https://www.instagram.com/",
  },
  {
    id: 8,
    platform: "Truth Social",
    account: "Yemen keyword monitor",
    handle: "Truth Social",
    language: "English",
    status: "Planned",
    topic: "Politics",
    text: "Public Yemen-related Truth Social activity will appear here if reliable access is available.",
    url: "https://truthsocial.com/",
  },
  {
    id: 9,
    platform: "Substack",
    account: "Yemen newsletter monitor",
    handle: "Substack",
    language: "English",
    status: "Planned",
    topic: "Analysis",
    text: "Yemen-related newsletters and analyst posts will appear here.",
    url: "https://substack.com/",
  },
  {
    id: 10,
    platform: "Mastodon",
    account: "Yemen keyword monitor",
    handle: "Mastodon",
    language: "Multiple",
    status: "Planned",
    topic: "General",
    text: "Public posts from selected Mastodon instances can appear here.",
    url: "https://joinmastodon.org/",
  },
];

const platforms = [
  "All",
  "X",
  "Reddit",
  "Bluesky",
  "YouTube",
  "Telegram",
  "Facebook",
  "Instagram",
  "Truth Social",
  "Substack",
  "Mastodon",
];

export default function SocialMonitorPage() {
  const [search, setSearch] =
    useState("");

  const [activePlatform, setActivePlatform] =
    useState("All");

  const filtered = useMemo(() => {
    const query =
      search.toLowerCase().trim();

    return socialItems.filter(
      (item) => {
        const matchesPlatform =
          activePlatform === "All" ||
          item.platform === activePlatform;

        const matchesSearch =
          !query ||
          item.platform
            .toLowerCase()
            .includes(query) ||
          item.account
            .toLowerCase()
            .includes(query) ||
          item.handle
            .toLowerCase()
            .includes(query) ||
          item.topic
            .toLowerCase()
            .includes(query) ||
          item.text
            .toLowerCase()
            .includes(query);

        return (
          matchesPlatform &&
          matchesSearch
        );
      }
    );
  }, [
    search,
    activePlatform,
  ]);

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
              SOCIAL INTELLIGENCE
            </div>

            <h1>
              Social Monitor
            </h1>

            <p>
              Public social reporting related to Yemen and the Red Sea.
              Social posts will remain separate from confirmed news reporting.
            </p>
          </div>

          <div className="feedSearch">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search platforms or topics"
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
          {platforms.map(
            (platform) => (
              <button
                key={platform}
                className={
                  activePlatform === platform
                    ? "categoryButton activeCategoryButton"
                    : "categoryButton"
                }
                onClick={() =>
                  setActivePlatform(
                    platform
                  )
                }
              >
                {platform}

                <span>
                  {platform === "All"
                    ? socialItems.length
                    : socialItems.filter(
                        (item) =>
                          item.platform === platform
                      ).length}
                </span>
              </button>
            )
          )}
        </div>

        <div className="socialNotice">
          <CircleAlert size={17} />

          <div>
            <strong>
              Social content is not automatically verified.
            </strong>

            <p>
              Future live posts will be labeled by source status and confidence before they are treated as confirmed reporting.
            </p>
          </div>
        </div>

        <div className="sourcesGrid">
          {filtered.map(
            (item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="sourceCard socialCard"
              >
                <div className="sourceCardTop">
                  <div className="sourceIcon">
                    <Filter size={18} />
                  </div>

                  <span className="sourceStatus plannedSource">
                    {item.status}
                  </span>
                </div>

                <div className="socialPlatform">
                  {item.platform}
                </div>

                <h2>
                  {item.account}
                </h2>

                <div className="socialHandle">
                  {item.handle}
                </div>

                <p className="socialText">
                  {item.text}
                </p>

                <div className="sourceDetails">
                  <span>
                    {item.language}
                  </span>

                  <span>
                    {item.topic}
                  </span>

                  <span className="socialVerification">
                    <BadgeCheck size={12} />
                    Awaiting connection
                  </span>
                </div>
              </a>
            )
          )}
        </div>
      </section>
    </main>
  );
}
