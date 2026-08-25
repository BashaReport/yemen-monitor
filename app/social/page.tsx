"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CircleAlert,
  ExternalLink,
  Search,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

type SocialItem = {
  id: string;
  platform: string;
  account: string;
  handle: string;
  text: string;
  url: string;
  date: string;
  topic: string;
  language: string;
  status: string;
  relevance: number;
};

type SocialResponse = {
  ok: boolean;
  updatedAt?: string;
  authenticatedAs?: string;
  count?: number;

  providers?: {
    bluesky?: number;
    reddit?: number;
  };

  redditStatus?: string;

  topicCounts?: Record<string, number>;
  languageCounts?: Record<string, number>;

  items?: SocialItem[];

  error?: string;
};

const topics = [
  "All",
  "Security",
  "Maritime",
  "Politics",
  "Humanitarian",
  "General",
];

const platforms = [
  "All",
  "Bluesky",
  "Reddit",
];

export default function SocialMonitorPage() {
  const [items, setItems] =
    useState<SocialItem[]>([]);

  const [search, setSearch] =
    useState("");

  const [
    activePlatform,
    setActivePlatform,
  ] = useState("All");

  const [
    activeTopic,
    setActiveTopic,
  ] = useState("All");

  const [
    redditStatus,
    setRedditStatus,
  ] = useState(
    "Awaiting API approval"
  );

  const [
    authenticatedAs,
    setAuthenticatedAs,
  ] = useState("");

  const [
    updatedAt,
    setUpdatedAt,
  ] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    async function loadSocial() {
      try {
        const response =
          await fetch(
            "/api/social",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "Social request failed"
          );
        }

        const data: SocialResponse =
          await response.json();

        if (!data.ok) {
          throw new Error(
            data.error ||
              "Social API returned an error"
          );
        }

        setItems(
          data.items || []
        );

        setRedditStatus(
          data.redditStatus ||
            "Awaiting API approval"
        );

        setAuthenticatedAs(
          data.authenticatedAs ||
            ""
        );

        setUpdatedAt(
          data.updatedAt || ""
        );

        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadSocial();

    const interval =
      window.setInterval(
        loadSocial,
        300000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  const filtered =
    useMemo(() => {
      const query =
        search
          .toLowerCase()
          .trim();

      return items.filter(
        (item) => {
          const matchesPlatform =
            activePlatform ===
              "All" ||
            item.platform ===
              activePlatform;

          const matchesTopic =
            activeTopic ===
              "All" ||
            item.topic ===
              activeTopic;

          const matchesSearch =
            !query ||
            item.text
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
            item.language
              .toLowerCase()
              .includes(query);

          return (
            matchesPlatform &&
            matchesTopic &&
            matchesSearch
          );
        }
      );
    }, [
      items,
      activePlatform,
      activeTopic,
      search,
    ]);

  const blueskyCount =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.platform ===
            "Bluesky"
        ).length,
      [items]
    );

  const arabicCount =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.language
              .toLowerCase()
              .includes("ar")
        ).length,
      [items]
    );

  const securityCount =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.topic ===
            "Security"
        ).length,
      [items]
    );

  const maritimeCount =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.topic ===
            "Maritime"
        ).length,
      [items]
    );

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

      <section className="liveFeedPage">
        <Link
          href="/"
          className="backLink"
        >
          <ArrowLeft size={16} />
          Back to overview
        </Link>

        <div className="liveFeedHeading">
          <div>
            <div className="eyebrow">
              SOCIAL INTELLIGENCE
            </div>

            <h1>
              Social Monitor
            </h1>

            <p>
              Live public social
              reporting related to
              Yemen and the Red Sea.
            </p>
          </div>

          <div className="feedSearch">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search posts or accounts"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div className="metricsGrid">
          <SocialMetric
            label="Live social posts"
            value={String(
              items.length
            )}
            detail="Current monitored results"
          />

          <SocialMetric
            label="Bluesky"
            value={String(
              blueskyCount
            )}
            detail="Authenticated live feed"
          />

          <SocialMetric
            label="Security"
            value={String(
              securityCount
            )}
            detail="Social security reporting"
          />

          <SocialMetric
            label="Maritime"
            value={String(
              maritimeCount
            )}
            detail="Red Sea reporting"
          />
        </div>

        <div className="card filterCard">
          <div className="eyebrow">
            PLATFORM
          </div>

          <div className="categoryFilters">
            {platforms.map(
              (platform) => (
                <button
                  key={platform}
                  className={
                    activePlatform ===
                    platform
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
                    {platform ===
                    "All"
                      ? items.length
                      : platform ===
                        "Bluesky"
                      ? blueskyCount
                      : 0}
                  </span>
                </button>
              )
            )}
          </div>

          <div
            className="eyebrow"
            style={{
              marginTop: "18px",
            }}
          >
            TOPIC
          </div>

          <div className="categoryFilters">
            {topics.map(
              (topic) => (
                <button
                  key={topic}
                  className={
                    activeTopic ===
                    topic
                      ? "categoryButton activeCategoryButton"
                      : "categoryButton"
                  }
                  onClick={() =>
                    setActiveTopic(
                      topic
                    )
                  }
                >
                  {topic}

                  <span>
                    {topic === "All"
                      ? items.length
                      : items.filter(
                          (item) =>
                            item.topic ===
                            topic
                        ).length}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems:
                "flex-start",
            }}
          >
            <CircleAlert
              size={18}
            />

            <div>
              <div className="eyebrow">
                VERIFICATION NOTICE
              </div>

              <p
                style={{
                  marginBottom: 0,
                  lineHeight: 1.6,
                }}
              >
                Social posts are
                displayed as
                unverified public
                reporting. They
                should not be treated
                as confirmed facts
                unless supported by
                independent reporting.
              </p>
            </div>
          </div>
        </div>

        <div
          className="liveFeedResults"
          style={{
            marginTop: "14px",
          }}
        >
          <div className="feedResultsHeader">
            <span>
              {filtered.length} posts
            </span>

            <span>
              {arabicCount} Arabic
              {" · "}
              Reddit{" "}
              {redditStatus}
            </span>
          </div>

          {authenticatedAs && (
            <div
              className="feedResultsHeader"
              style={{
                textTransform:
                  "none",
              }}
            >
              <span>
                Bluesky connected as{" "}
                {authenticatedAs}
              </span>

              <span>
                {updatedAt
                  ? `Updated ${formatUpdateTime(
                      updatedAt
                    )}`
                  : ""}
              </span>
            </div>
          )}

          {loading && (
            <div className="liveFeedEmpty">
              Loading social
              reporting...
            </div>
          )}

          {error && (
            <div className="liveFeedEmpty">
              Unable to load social
              reporting.
            </div>
          )}

          {!loading &&
            !error &&
            filtered.length ===
              0 && (
              <div className="liveFeedEmpty">
                No matching social
                posts.
              </div>
            )}

          {!loading &&
            !error &&
            filtered.map(
              (item) => (
                <article
                  key={item.id}
                  className="liveFeedRow"
                >
                  <div className="liveFeedTime">
                    {formatTime(
                      item.date
                    )}
                  </div>

                  <div className="liveFeedBody">
                    <div className="feedMeta">
                      {item.platform}
                      {" · "}
                      {item.topic}
                      {" · "}
                      {item.language}
                      {" · "}
                      {item.status}
                    </div>

                    <div
                      style={{
                        marginBottom:
                          "7px",
                        color:
                          "#75655e",
                        fontSize:
                          "11px",
                      }}
                    >
                      {item.account}
                      {" "}
                      {item.handle}
                    </div>

                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="liveFeedTitle"
                    >
                      {item.text}
                    </a>

                    <div
                      style={{
                        marginTop:
                          "9px",
                      }}
                    >
                      <a
                        href={
                          item.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="backLink"
                        style={{
                          marginBottom:
                            0,
                        }}
                      >
                        Open original
                        post
                        <ExternalLink
                          size={13}
                        />
                      </a>
                    </div>
                  </div>

                  <div
                    className="relevanceBadge"
                    title="Relevance score"
                  >
                    {
                      item.relevance
                    }
                  </div>
                </article>
              )
            )}
        </div>
      </section>
    </main>
  );
}

function SocialMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metricCard">
      <div>
        <div className="metricLabel">
          {label}
        </div>

        <div className="metricValue">
          {value}
        </div>

        <div className="metricDetail">
          {detail}
        </div>
      </div>
    </div>
  );
}

function formatTime(
  date: string
) {
  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  return parsed.toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  );
}

function formatUpdateTime(
  date: string
) {
  const parsed =
    new Date(date);

  if (
    Number.isNaN(
      parsed.getTime()
    )
  ) {
    return "";
  }

  return parsed.toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
}
