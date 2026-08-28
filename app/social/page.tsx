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

  items?: SocialItem[];

  error?: string;
};

type SubstackPost = {
  id: string;
  platform: string;
  source: string;
  author: string;
  title: string;
  text: string;
  url: string;
  image?: string;
  publishedAt?: string | null;
};

type SubstackResponse = {
  ok: boolean;
  count?: number;
  posts?: SubstackPost[];
  error?: string;
};

const topics = [
  "All",
  "Security",
  "Maritime",
  "Politics",
  "Humanitarian",
  "Economy",
  "General",
];

const platforms = [
  "All",
  "Bluesky",
  "Substack",
  "Reddit",
];

function detectTopic(
  title: string,
  text: string
) {
  const combined =
    `${title} ${text}`.toLowerCase();

  if (
    combined.includes("ship") ||
    combined.includes("vessel") ||
    combined.includes("red sea") ||
    combined.includes("gulf of aden") ||
    combined.includes("bab al-mandab") ||
    combined.includes("maritime") ||
    combined.includes("port") ||
    combined.includes("shipping")
  ) {
    return "Maritime";
  }

  if (
    combined.includes("attack") ||
    combined.includes("strike") ||
    combined.includes("missile") ||
    combined.includes("drone") ||
    combined.includes("military") ||
    combined.includes("fighter") ||
    combined.includes("battle") ||
    combined.includes("houthi")
  ) {
    return "Security";
  }

  if (
    combined.includes("government") ||
    combined.includes("minister") ||
    combined.includes("president") ||
    combined.includes("political") ||
    combined.includes("diplomatic") ||
    combined.includes("negotiation")
  ) {
    return "Politics";
  }

  if (
    combined.includes("humanitarian") ||
    combined.includes("food") ||
    combined.includes("famine") ||
    combined.includes("health") ||
    combined.includes("displacement") ||
    combined.includes("aid")
  ) {
    return "Humanitarian";
  }

  if (
    combined.includes("economy") ||
    combined.includes("economic") ||
    combined.includes("oil") ||
    combined.includes("gas") ||
    combined.includes("currency") ||
    combined.includes("inflation")
  ) {
    return "Economy";
  }

  return "General";
}

function substackToSocialItem(
  post: SubstackPost
): SocialItem {
  const description =
    post.text?.trim() || "";

  const displayText =
    description
      ? `${post.title} — ${description}`
      : post.title;

  return {
    id: `substack-${post.id}`,
    platform: "Substack",
    account:
      post.source ||
      "Basha Report",
    handle:
      post.author || "",
    text: displayText,
    url: post.url,
    date:
      post.publishedAt ||
      new Date().toISOString(),
    topic: detectTopic(
      post.title,
      post.text
    ),
    language: "EN",
    status: "Published analysis",
    relevance: 8,
  };
}

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
        const [
          socialResponse,
          substackResponse,
        ] = await Promise.all([
          fetch(
            "/api/social",
            {
              cache: "no-store",
            }
          ),

          fetch(
            "/api/substack",
            {
              cache: "no-store",
            }
          ),
        ]);

        let socialItems:
          SocialItem[] = [];

        let substackItems:
          SocialItem[] = [];

        if (socialResponse.ok) {
          const data:
            SocialResponse =
              await socialResponse.json();

          if (data.ok) {
            socialItems =
              data.items || [];

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
          }
        }

        if (
          substackResponse.ok
        ) {
          const data:
            SubstackResponse =
              await substackResponse.json();

          if (data.ok) {
            substackItems = (
              data.posts || []
            ).map(
              substackToSocialItem
            );
          }
        }

        const combined = [
          ...socialItems,
          ...substackItems,
        ].sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        );

        setItems(combined);

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

  const substackCount =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.platform ===
            "Substack"
        ).length,
      [items]
    );

  const redditCount =
    useMemo(
      () =>
        items.filter(
          (item) =>
            item.platform ===
            "Reddit"
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

  function platformCount(
    platform: string
  ) {
    if (platform === "All") {
      return items.length;
    }

    if (
      platform === "Bluesky"
    ) {
      return blueskyCount;
    }

    if (
      platform === "Substack"
    ) {
      return substackCount;
    }

    if (
      platform === "Reddit"
    ) {
      return redditCount;
    }

    return 0;
  }

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
              Public reporting and
              analysis from Bluesky,
              Substack and connected
              social sources.
            </p>
          </div>

          <div className="feedSearch">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search posts, analysis or accounts"
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
            label="Social items"
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
            detail="Live social reporting"
          />

          <SocialMetric
            label="Substack"
            value={String(
              substackCount
            )}
            detail="Basha Report analysis"
          />

          <SocialMetric
            label="Mapped topics"
            value={String(
              securityCount +
                maritimeCount
            )}
            detail="Security and maritime"
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
                    {platformCount(
                      platform
                    )}
                  </span>
                </button>
              )
            )}
          </div>

          <div
            className="eyebrow"
            style={{
              marginTop:
                "18px",
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
                SOURCE NOTICE
              </div>

              <p
                style={{
                  marginBottom: 0,
                  lineHeight: 1.6,
                }}
              >
                Social posts are
                treated as unverified
                public reporting.
                Substack items are
                published analysis and
                should be evaluated
                according to their
                source and supporting
                evidence.
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
              {filtered.length} items
            </span>

            <span>
              {blueskyCount} Bluesky
              {" · "}
              {substackCount} Substack
              {" · "}
              {arabicCount} Arabic
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
                Reddit{" "}
                {redditStatus}
              </span>
            </div>
          )}

          {updatedAt && (
            <div
              className="feedResultsHeader"
              style={{
                textTransform:
                  "none",
              }}
            >
              <span>
                Social sources active
              </span>

              <span>
                Updated{" "}
                {formatUpdateTime(
                  updatedAt
                )}
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
                items.
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

                      {item.handle
                        ? ` · ${item.handle}`
                        : ""}
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
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="backLink"
                        style={{
                          marginBottom:
                            0,
                        }}
                      >
                        {item.platform ===
                        "Substack"
                          ? "Read analysis"
                          : "Open original post"}

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
