"use client";

import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

import {
  Activity,
  Bell,
  ChevronDown,
  CircleDot,
  Clock3,
  ExternalLink,
  Globe2,
  MapPinned,
  Menu,
  MessageCircle,
  Search,
  ShieldAlert,
  Ship,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

const MapClient = dynamic(
  () => import("./map/MapClient"),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "360px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e8ded1",
          borderRadius: "12px",
          color: "#6c5a54",
        }}
      >
        Loading live map...
      </div>
    ),
  }
);

type Article = {
  id: number;
  title: string;
  url: string;
  date: string;
  source: string;
  category: string;
  relevance: number;
  provider?: string;
};

type NewsResponse = {
  updatedAt: string;
  count: number;
  googleCount?: number;
  reliefWebCount?: number;
  reliefWebFetched?: number;
  articles: Article[];
};

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
  count?: number;

  providers?: {
    bluesky?: number;
    reddit?: number;
  };

  redditStatus?: string;
  items?: SocialItem[];
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
};

type MapLocation = {
  name: string;
  type: string;
  lat: number;
  lon: number;
  keywords: string[];
};

type MappedIncident = {
  article: Article;
  location: MapLocation;
};

const monitoredLocations: MapLocation[] = [
  {
    name: "Sana'a",
    type: "Capital",
    lat: 15.3694,
    lon: 44.191,
    keywords: [
      "sanaa",
      "sana'a",
      "صنعاء",
    ],
  },
  {
    name: "Aden",
    type: "Southern hub",
    lat: 12.7855,
    lon: 45.0187,
    keywords: [
      "aden",
      "عدن",
    ],
  },
  {
    name: "Hudaydah",
    type: "Red Sea port",
    lat: 14.7979,
    lon: 42.9545,
    keywords: [
      "hudaydah",
      "hodeidah",
      "الحديدة",
    ],
  },
  {
    name: "Marib",
    type: "Central front",
    lat: 15.4625,
    lon: 45.3258,
    keywords: [
      "marib",
      "ma'rib",
      "مأرب",
    ],
  },
  {
    name: "Taiz",
    type: "Front line",
    lat: 13.5795,
    lon: 44.0209,
    keywords: [
      "taiz",
      "تعز",
    ],
  },
  {
    name: "Mukalla",
    type: "Hadramout",
    lat: 14.5425,
    lon: 49.1242,
    keywords: [
      "mukalla",
      "المكلا",
    ],
  },
  {
    name: "Saada",
    type: "Northern stronghold",
    lat: 16.9402,
    lon: 43.7639,
    keywords: [
      "saada",
      "sa'dah",
      "صعدة",
    ],
  },
  {
    name: "Shabwa",
    type: "Southern governorate",
    lat: 14.5377,
    lon: 46.8319,
    keywords: [
      "shabwa",
      "شبوة",
    ],
  },
  {
    name: "Hadramout",
    type: "Eastern governorate",
    lat: 15.9304,
    lon: 48.6267,
    keywords: [
      "hadramout",
      "hadramawt",
      "حضرموت",
    ],
  },
  {
    name: "Bab al-Mandab",
    type: "Maritime chokepoint",
    lat: 12.5833,
    lon: 43.3333,
    keywords: [
      "bab al-mandab",
      "bab el-mandeb",
      "باب المندب",
    ],
  },
  {
    name: "Red Sea",
    type: "Maritime zone",
    lat: 15.5,
    lon: 42.4,
    keywords: [
      "red sea",
      "البحر الأحمر",
    ],
  },
  {
    name: "Gulf of Aden",
    type: "Maritime zone",
    lat: 12.2,
    lon: 47.5,
    keywords: [
      "gulf of aden",
      "خليج عدن",
    ],
  },
];

const categories = [
  "All",
  "Security",
  "Maritime",
  "Politics",
  "Humanitarian",
  "Economy",
  "General",
];

const timeOptions = [
  {
    label: "1 hour",
    hours: 1,
  },
  {
    label: "6 hours",
    hours: 6,
  },
  {
    label: "12 hours",
    hours: 12,
  },
  {
    label: "24 hours",
    hours: 24,
  },
];

const navItems = [
  {
    name: "Overview",
    href: "/",
  },
  {
    name: "Live Feed",
    href: "/live-feed",
  },
  {
    name: "Social",
    href: "/social",
  },
  {
    name: "Map",
    href: "/map",
  },
  {
    name: "Maritime",
    href: "/maritime",
  },
  {
    name: "Politics",
    href: "/politics",
  },
  {
    name: "Humanitarian",
    href: "/humanitarian",
  },
  {
    name: "Economy",
    href: "/economy",
  },
  {
    name: "Sources",
    href: "/sources",
  },
  {
    name: "Contact Us",
    href: "/contact",
  },
];

function findArticleLocation(
  article: Article
) {
  const text =
    article.title.toLowerCase();

  return monitoredLocations.find(
    (location) =>
      location.keywords.some(
        (keyword) =>
          text.includes(
            keyword.toLowerCase()
          )
      )
  );
}

function detectSubstackTopic(
  post: SubstackPost
) {
  const text =
    `${post.title} ${post.text}`.toLowerCase();

  if (
    text.includes("ship") ||
    text.includes("vessel") ||
    text.includes("red sea") ||
    text.includes("gulf of aden") ||
    text.includes("maritime") ||
    text.includes("port")
  ) {
    return "Maritime";
  }

  if (
    text.includes("attack") ||
    text.includes("strike") ||
    text.includes("missile") ||
    text.includes("drone") ||
    text.includes("military") ||
    text.includes("houthi") ||
    text.includes("battle")
  ) {
    return "Security";
  }

  if (
    text.includes("government") ||
    text.includes("political") ||
    text.includes("minister") ||
    text.includes("president") ||
    text.includes("negotiation")
  ) {
    return "Politics";
  }

  if (
    text.includes("food") ||
    text.includes("health") ||
    text.includes("humanitarian") ||
    text.includes("aid") ||
    text.includes("displacement")
  ) {
    return "Humanitarian";
  }

  if (
    text.includes("oil") ||
    text.includes("gas") ||
    text.includes("economy") ||
    text.includes("economic") ||
    text.includes("currency")
  ) {
    return "Economy";
  }

  return "General";
}

function substackToSocialItem(
  post: SubstackPost
): SocialItem {
  return {
    id: `substack-${post.id}`,
    platform: "Substack",
    account:
      post.source ||
      "Basha Report",
    handle:
      post.author || "",
    text:
      post.text?.trim()
        ? `${post.title} — ${post.text}`
        : post.title,
    url: post.url,
    date:
      post.publishedAt ||
      new Date().toISOString(),
    topic:
      detectSubstackTopic(post),
    language: "EN",
    status:
      "Published analysis",
    relevance: 8,
  };
}

export default function Home() {
  const [articles, setArticles] =
    useState<Article[]>([]);

  const [updatedAt, setUpdatedAt] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  const [
    selectedHours,
    setSelectedHours,
  ] = useState(24);

  const [
    socialItems,
    setSocialItems,
  ] = useState<SocialItem[]>([]);

  const [
    socialLoading,
    setSocialLoading,
  ] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const response =
          await fetch(
            "/api/news",
            {
              cache: "no-store",
            }
          );

        if (!response.ok) {
          throw new Error(
            "News request failed"
          );
        }

        const data: NewsResponse =
          await response.json();

        setArticles(
          data.articles || []
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

        let combined:
          SocialItem[] = [];

        if (socialResponse.ok) {
          const data:
            SocialResponse =
              await socialResponse.json();

          if (data.ok) {
            combined.push(
              ...(data.items || [])
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
            combined.push(
              ...(data.posts || []).map(
                substackToSocialItem
              )
            );
          }
        }

        combined = combined.sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        );

        setSocialItems(
          combined
        );
      } catch (err) {
        console.error(
          "Homepage social error",
          err
        );
      } finally {
        setSocialLoading(false);
      }
    }

    loadNews();
    loadSocial();

    const interval =
      window.setInterval(
        () => {
          loadNews();
          loadSocial();
        },
        300000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  const timeFilteredArticles =
    useMemo(() => {
      const cutoff =
        Date.now() -
        selectedHours *
          60 *
          60 *
          1000;

      return articles.filter(
        (article) => {
          const articleTime =
            new Date(
              article.date
            ).getTime();

          if (
            Number.isNaN(
              articleTime
            )
          ) {
            return false;
          }

          return (
            articleTime >=
            cutoff
          );
        }
      );
    }, [
      articles,
      selectedHours,
    ]);

  const filteredArticles =
    useMemo(() => {
      if (
        activeCategory === "All"
      ) {
        return timeFilteredArticles;
      }

      return timeFilteredArticles.filter(
        (article) =>
          article.category ===
          activeCategory
      );
    }, [
      timeFilteredArticles,
      activeCategory,
    ]);

  const mappedIncidents =
    useMemo(() => {
      const mapped:
        MappedIncident[] = [];

      timeFilteredArticles.forEach(
        (article) => {
          const location =
            findArticleLocation(
              article
            );

          if (location) {
            mapped.push({
              article,
              location,
            });
          }
        }
      );

      return mapped;
    }, [timeFilteredArticles]);

  const maritimeCount =
    useMemo(
      () =>
        timeFilteredArticles.filter(
          (article) =>
            article.category ===
            "Maritime"
        ).length,
      [timeFilteredArticles]
    );

  const securityCount =
    useMemo(
      () =>
        timeFilteredArticles.filter(
          (article) =>
            article.category ===
            "Security"
        ).length,
      [timeFilteredArticles]
    );

  const humanitarianCount =
    useMemo(
      () =>
        timeFilteredArticles.filter(
          (article) =>
            article.category ===
            "Humanitarian"
        ).length,
      [timeFilteredArticles]
    );

  const reliefWebCount =
    useMemo(
      () =>
        timeFilteredArticles.filter(
          (article) =>
            article.provider ===
            "ReliefWeb"
        ).length,
      [timeFilteredArticles]
    );

  const socialCount =
    socialItems.length;

  const blueskyCount =
    socialItems.filter(
      (item) =>
        item.platform ===
        "Bluesky"
    ).length;

  const substackCount =
    socialItems.filter(
      (item) =>
        item.platform ===
        "Substack"
    ).length;

  const latestArticles =
    filteredArticles.slice(
      0,
      12
    );

  const latestSocialItems =
    socialItems.slice(
      0,
      4
    );

  const formattedUpdate =
    updatedAt
      ? new Date(
          updatedAt
        ).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
          }
        )
      : "Loading";

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

        <div className="topActions">
          <button
            className="iconButton"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <button
            className="iconButton"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>

          <button className="langButton">
            EN
            <ChevronDown
              size={14}
            />
          </button>
        </div>
      </header>

      <nav className="navRow">
        <button
          className="menuButton"
          aria-label="Menu"
        >
          <Menu size={18} />
        </button>

        {navItems.map(
          (item, index) => (
            <Link
              className={
                index === 0
                  ? "activeNav"
                  : ""
              }
              key={item.name}
              href={item.href}
            >
              {item.name}
            </Link>
          )
        )}
      </nav>

      <section className="statusStrip">
        <div className="live">
          <span className="liveDot" />
          LIVE MONITORING
        </div>

        <div className="statusItem">
          <Clock3 size={14} />
          Updated{" "}
          {formattedUpdate}
        </div>

        <div className="statusItem">
          <Globe2 size={14} />
          Yemen + Red Sea
        </div>

        <div className="statusItem">
          <CircleDot size={14} />
          {
            timeFilteredArticles.length
          }{" "}
          live reports
        </div>

        {reliefWebCount > 0 && (
          <div className="statusItem">
            <Globe2 size={14} />
            {reliefWebCount} direct
            ReliefWeb reports
          </div>
        )}

        {socialCount > 0 && (
          <Link
            href="/social"
            className="statusItem"
          >
            <MessageCircle
              size={14}
            />
            {socialCount} social items
          </Link>
        )}
      </section>

      <section className="hero">
        <div>
          <div className="eyebrow">
            SITUATION OVERVIEW
          </div>

          <h1>
            Yemen Monitor
          </h1>

          <p>
            Independent monitoring
            and analysis of
            developments in Yemen
            and the Red Sea.
          </p>
        </div>

        <div className="heroControls">
          <label className="homepageTimeFilter">
            <span>
              Time window
            </span>

            <div className="selectBox">
              <select
                value={
                  selectedHours
                }
                onChange={(
                  event
                ) =>
                  setSelectedHours(
                    Number(
                      event.target
                        .value
                    )
                  )
                }
              >
                {timeOptions.map(
                  (option) => (
                    <option
                      key={
                        option.hours
                      }
                      value={
                        option.hours
                      }
                    >
                      Last{" "}
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>

              <ChevronDown
                size={14}
              />
            </div>
          </label>
        </div>
      </section>

      <section className="metricsGrid">
        <Metric
          icon={
            <ShieldAlert
              size={18}
            />
          }
          label="Security reports"
          value={String(
            securityCount
          )}
          detail={`Last ${selectedHours} hours`}
        />

        <Metric
          icon={
            <Activity
              size={18}
            />
          }
          label="News volume"
          value={String(
            timeFilteredArticles.length
          )}
          detail={`Last ${selectedHours} hours`}
        />

        <Metric
          icon={
            <Ship
              size={18}
            />
          }
          label="Maritime reports"
          value={String(
            maritimeCount
          )}
          detail="Red Sea and Gulf of Aden"
        />

        <Metric
          icon={
            <MapPinned
              size={18}
            />
          }
          label="Humanitarian"
          value={String(
            humanitarianCount
          )}
          detail={`Last ${selectedHours} hours`}
        />
      </section>

      <section
        style={{
          padding:
            "0 38px 14px",
        }}
      >
        <div
          className="card"
          style={{
            padding: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "flex-start",
              gap: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "15px",
                alignItems:
                  "flex-start",
                flex: 1,
              }}
            >
              <div className="metricIcon">
                <MessageCircle
                  size={19}
                />
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div className="eyebrow">
                  LIVE SOCIAL MONITORING
                </div>

                <h2
                  style={{
                    marginBottom:
                      "6px",
                  }}
                >
                  Social Monitor
                </h2>

                <div
                  style={{
                    color:
                      "#806e67",
                    fontSize:
                      "10px",
                    marginBottom:
                      "14px",
                  }}
                >
                  {blueskyCount} Bluesky
                  {" · "}
                  {substackCount} Substack
                </div>

                {socialLoading && (
                  <p>
                    Loading public
                    reporting...
                  </p>
                )}

                {!socialLoading &&
                  latestSocialItems.length ===
                    0 && (
                    <p>
                      No social reporting
                      is available right
                      now.
                    </p>
                  )}

                {!socialLoading &&
                  latestSocialItems.length >
                    0 && (
                    <div>
                      {latestSocialItems.map(
                        (
                          item,
                          index
                        ) => (
                          <a
                            key={
                              item.id
                            }
                            href={
                              item.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display:
                                "grid",
                              gridTemplateColumns:
                                "66px 1fr",
                              gap:
                                "12px",
                              padding:
                                index ===
                                0
                                  ? "0 0 11px"
                                  : "11px 0",
                              borderTop:
                                index ===
                                0
                                  ? "0"
                                  : "1px solid rgba(50, 3, 3, 0.09)",
                              textDecoration:
                                "none",
                              color:
                                "inherit",
                            }}
                          >
                            <div
                              style={{
                                color:
                                  "#806e67",
                                fontSize:
                                  "10px",
                              }}
                            >
                              {formatSocialTime(
                                item.date
                              )}
                            </div>

                            <div>
                              <div
                                style={{
                                  color:
                                    "#a86604",
                                  fontSize:
                                    "9px",
                                  fontWeight:
                                    800,
                                  textTransform:
                                    "uppercase",
                                  marginBottom:
                                    "4px",
                                }}
                              >
                                {
                                  item.platform
                                }
                                {" · "}
                                {
                                  item.topic
                                }
                                {" · "}
                                {
                                  item.account
                                }
                              </div>

                              <div
                                style={{
                                  fontFamily:
                                    "Georgia, serif",
                                  fontSize:
                                    "14px",
                                  lineHeight:
                                    1.4,
                                  display:
                                    "-webkit-box",
                                  WebkitLineClamp:
                                    1,
                                  WebkitBoxOrient:
                                    "vertical",
                                  overflow:
                                    "hidden",
                                }}
                              >
                                {
                                  item.text
                                }
                              </div>
                            </div>
                          </a>
                        )
                      )}
                    </div>
                  )}
              </div>
            </div>

            <Link
              href="/social"
              style={{
                minWidth:
                  "150px",
                textAlign:
                  "right",
                textDecoration:
                  "none",
                color:
                  "inherit",
              }}
            >
              <div
                style={{
                  color:
                    "#320303",
                  fontFamily:
                    "Georgia, serif",
                  fontSize:
                    "30px",
                }}
              >
                {
                  socialCount
                }
              </div>

              <div
                style={{
                  color:
                    "#75655e",
                  fontSize:
                    "10px",
                  textTransform:
                    "uppercase",
                }}
              >
                Social items
              </div>

              <div
                style={{
                  marginTop:
                    "13px",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: "6px",
                  color:
                    "#a86604",
                  fontSize:
                    "11px",
                  fontWeight:
                    700,
                }}
              >
                Open Social Monitor

                <ExternalLink
                  size={13}
                />
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="card filterCard">
        <div className="eyebrow">
          FILTER LIVE FEED
        </div>

        <div className="categoryFilters">
          {categories.map(
            (category) => {
              const count =
                category === "All"
                  ? timeFilteredArticles.length
                  : timeFilteredArticles.filter(
                      (
                        article
                      ) =>
                        article.category ===
                        category
                    ).length;

              return (
                <button
                  key={
                    category
                  }
                  className={
                    activeCategory ===
                    category
                      ? "categoryButton activeCategoryButton"
                      : "categoryButton"
                  }
                  onClick={() =>
                    setActiveCategory(
                      category
                    )
                  }
                >
                  {category}

                  <span>
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </section>

      <section className="dashboardGrid">
        <div className="card feedCard fullFeedCard">
          <div className="cardHeader">
            <div>
              <div className="eyebrow">
                LATEST DEVELOPMENTS
              </div>

              <h2>
                {activeCategory ===
                "All"
                  ? `Live Yemen intelligence feed · ${selectedHours}h`
                  : `${activeCategory} reporting · ${selectedHours}h`}
              </h2>
            </div>

            <Link
              href="/live-feed"
              className="goldPill"
            >
              View full feed
            </Link>
          </div>

          <div className="feedList">
            {loading && (
              <div className="feedItem">
                Loading live reports...
              </div>
            )}

            {error && (
              <div className="feedItem">
                Unable to load live
                reporting.
              </div>
            )}

            {!loading &&
              !error &&
              latestArticles.length ===
                0 && (
                <div className="feedItem">
                  No reports in this
                  category during the
                  selected time window.
                </div>
              )}

            {!loading &&
              !error &&
              latestArticles.map(
                (article) => (
                  <article
                    className="feedItem"
                    key={
                      article.id
                    }
                  >
                    <div className="timeCol">
                      {formatArticleTime(
                        article.date
                      )}
                    </div>

                    <div
                      className={`severity ${getSeverity(
                        article
                      )}`}
                    />

                    <div>
                      <div className="feedMeta">
                        {
                          article.category
                        }
                        {" · "}
                        {
                          article.source
                        }

                        {article.provider ===
                          "ReliefWeb" && (
                          <>
                            {" · "}
                            <span className="reliefWebLabel">
                              DIRECT RELIEFWEB
                            </span>
                          </>
                        )}

                        {" · "}
                        Relevance{" "}
                        {
                          article.relevance
                        }
                      </div>

                      <a
                        href={
                          article.url
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="feedTitle"
                      >
                        {
                          article.title
                        }
                      </a>
                    </div>
                  </article>
                )
              )}
          </div>
        </div>

        <div className="card mapCard">
          <div className="cardHeader">
            <div>
              <div className="eyebrow">
                LIVE MAP
              </div>

              <h2>
                Yemen activity
              </h2>
            </div>

            <Link
              href="/map"
              className="goldPill"
            >
              Open full map
            </Link>
          </div>

          <MapClient
            incidents={
              mappedIncidents
            }
            selectedLocation="All"
            height={360}
            zoom={5}
            scrollWheelZoom={
              false
            }
            compact={true}
          />

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              gap: "12px",
              marginTop:
                "12px",
              fontSize:
                "10px",
              color:
                "#75655e",
            }}
          >
            <span>
              {
                mappedIncidents.length
              }{" "}
              mapped reports in the
              selected time window
            </span>

            <Link
              href="/map"
              style={{
                color:
                  "#a86604",
                textDecoration:
                  "none",
                fontWeight:
                  700,
              }}
            >
              View map
            </Link>
          </div>
        </div>
      </section>

      <footer>
        <div>
          Basha Report · Yemen Monitor
        </div>

        <div>
          Independent monitoring and
          analysis
        </div>
      </footer>
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="metricCard">
      <div className="metricIcon">
        {icon}
      </div>

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

function formatArticleTime(
  date: string
) {
  if (!date) {
    return "";
  }

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

function formatSocialTime(
  date: string
) {
  if (!date) {
    return "";
  }

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

function getSeverity(
  article: Article
) {
  if (
    article.relevance >= 10
  ) {
    return "high";
  }

  if (
    article.relevance >= 6
  ) {
    return "medium";
  }

  return "low";
}
