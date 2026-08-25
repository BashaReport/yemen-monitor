"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Ship,
  ShieldAlert,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
  articles: Article[];
};

type LocationItem = {
  name: string;
  type: string;
  keywords: string[];
};

const monitoredLocations: LocationItem[] = [
  {
    name: "Sana'a",
    type: "Capital",
    keywords: [
      "sanaa",
      "sana'a",
      "صنعاء",
    ],
  },
  {
    name: "Aden",
    type: "Southern hub",
    keywords: [
      "aden",
      "عدن",
    ],
  },
  {
    name: "Hudaydah",
    type: "Red Sea port",
    keywords: [
      "hudaydah",
      "hodeidah",
      "الحديدة",
    ],
  },
  {
    name: "Marib",
    type: "Central front",
    keywords: [
      "marib",
      "مأرب",
    ],
  },
  {
    name: "Taiz",
    type: "Front line",
    keywords: [
      "taiz",
      "تعز",
    ],
  },
  {
    name: "Mukalla",
    type: "Hadramout",
    keywords: [
      "mukalla",
      "المكلا",
    ],
  },
  {
    name: "Saada",
    type: "Northern stronghold",
    keywords: [
      "saada",
      "صعدة",
    ],
  },
  {
    name: "Bab al-Mandab",
    type: "Maritime chokepoint",
    keywords: [
      "bab al-mandab",
      "bab el-mandeb",
      "باب المندب",
    ],
  },
  {
    name: "Red Sea",
    type: "Maritime zone",
    keywords: [
      "red sea",
      "البحر الأحمر",
    ],
  },
  {
    name: "Gulf of Aden",
    type: "Maritime zone",
    keywords: [
      "gulf of aden",
      "خليج عدن",
    ],
  },
];

export default function MapPage() {
  const [articles, setArticles] =
    useState<Article[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState("All");

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
            "Unable to load map reporting"
          );
        }

        const data: NewsResponse =
          await response.json();

        setArticles(
          data.articles || []
        );

        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadNews();

    const interval =
      window.setInterval(
        loadNews,
        300000
      );

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  const locationCounts =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      monitoredLocations.forEach(
        (location) => {
          counts[location.name] =
            articles.filter(
              (article) => {
                const title =
                  article.title.toLowerCase();

                return location.keywords.some(
                  (keyword) =>
                    title.includes(
                      keyword.toLowerCase()
                    )
                );
              }
            ).length;
        }
      );

      return counts;
    }, [articles]);

  const selectedArticles =
    useMemo(() => {
      if (
        selectedLocation ===
        "All"
      ) {
        return articles
          .filter(
            (article) =>
              article.relevance >= 6
          )
          .slice(0, 12);
      }

      const location =
        monitoredLocations.find(
          (item) =>
            item.name ===
            selectedLocation
        );

      if (!location) {
        return [];
      }

      return articles
        .filter(
          (article) => {
            const title =
              article.title.toLowerCase();

            return location.keywords.some(
              (keyword) =>
                title.includes(
                  keyword.toLowerCase()
                )
            );
          }
        )
        .slice(0, 12);
    }, [
      articles,
      selectedLocation,
    ]);

  const maritimeCount =
    articles.filter(
      (article) =>
        article.category ===
        "Maritime"
    ).length;

  const securityCount =
    articles.filter(
      (article) =>
        article.category ===
        "Security"
    ).length;

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

      <section
        className="liveFeedPage"
      >
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
              GEOGRAPHIC MONITORING
            </div>

            <h1>
              Yemen Map
            </h1>

            <p>
              Geographic view of
              Yemen, the Red Sea,
              Gulf of Aden and
              monitored reporting
              locations.
            </p>
          </div>
        </div>

        <div className="metricsGrid">
          <MapMetric
            icon={
              <MapPin size={18} />
            }
            label="Locations"
            value={String(
              monitoredLocations.length
            )}
            detail="Monitored areas"
          />

          <MapMetric
            icon={
              <ShieldAlert
                size={18}
              />
            }
            label="Security"
            value={String(
              securityCount
            )}
            detail="Current feed"
          />

          <MapMetric
            icon={
              <Ship size={18} />
            }
            label="Maritime"
            value={String(
              maritimeCount
            )}
            detail="Red Sea and Gulf"
          />

          <MapMetric
            icon={
              <MapPin size={18} />
            }
            label="Reports"
            value={String(
              articles.length
            )}
            detail="Available to map"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.45fr) minmax(300px, 0.55fr)",
            gap: "14px",
            marginTop: "14px",
          }}
        >
          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="eyebrow">
                  INTERACTIVE MAP
                </div>

                <h2>
                  Yemen and surrounding
                  waters
                </h2>
              </div>

              <a
                href="https://www.openstreetmap.org/#map=6/15.4/47.5"
                target="_blank"
                rel="noopener noreferrer"
                className="goldPill"
              >
                Open full map
              </a>
            </div>

            <div
              style={{
                overflow: "hidden",
                borderRadius:
                  "12px",
                border:
                  "1px solid rgba(50, 3, 3, 0.12)",
                height:
                  "620px",
                background:
                  "#e8ded1",
              }}
            >
              <iframe
                title="Yemen OpenStreetMap"
                src="https://www.openstreetmap.org/export/embed.html?bbox=41.0%2C10.0%2C56.0%2C20.0&layer=mapnik"
                style={{
                  width: "100%",
                  height: "100%",
                  border: 0,
                }}
                loading="lazy"
              />
            </div>
          </div>

          <div className="card">
            <div className="cardHeader">
              <div>
                <div className="eyebrow">
                  MONITORED LOCATIONS
                </div>

                <h2>
                  Activity
                </h2>
              </div>
            </div>

            <button
              className={
                selectedLocation ===
                "All"
                  ? "categoryButton activeCategoryButton"
                  : "categoryButton"
              }
              style={{
                marginBottom:
                  "10px",
              }}
              onClick={() =>
                setSelectedLocation(
                  "All"
                )
              }
            >
              All locations

              <span>
                {articles.length}
              </span>
            </button>

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
              }}
            >
              {monitoredLocations.map(
                (location) => (
                  <button
                    key={
                      location.name
                    }
                    onClick={() =>
                      setSelectedLocation(
                        location.name
                      )
                    }
                    style={{
                      width: "100%",
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr auto",
                      gap: "12px",
                      textAlign:
                        "left",
                      padding:
                        "13px 0",
                      border: 0,
                      borderTop:
                        "1px solid rgba(50, 3, 3, 0.09)",
                      background:
                        "transparent",
                      color:
                        selectedLocation ===
                        location.name
                          ? "#320303"
                          : "#49322e",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily:
                            "Georgia, serif",
                          fontSize:
                            "15px",
                          marginBottom:
                            "3px",
                        }}
                      >
                        {
                          location.name
                        }
                      </div>

                      <div
                        style={{
                          color:
                            "#806e67",
                          fontSize:
                            "10px",
                        }}
                      >
                        {
                          location.type
                        }
                      </div>
                    </div>

                    <div className="relevanceBadge">
                      {
                        locationCounts[
                          location.name
                        ] || 0
                      }
                    </div>
                  </button>
                )
              )}
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
              {selectedLocation ===
              "All"
                ? "High relevance reports"
                : `${selectedLocation} reports`}
            </span>

            <span>
              {
                selectedArticles.length
              }{" "}
              results
            </span>
          </div>

          {loading && (
            <div className="liveFeedEmpty">
              Loading map
              reporting...
            </div>
          )}

          {error && (
            <div className="liveFeedEmpty">
              Unable to load
              reporting.
            </div>
          )}

          {!loading &&
            !error &&
            selectedArticles.length ===
              0 && (
              <div className="liveFeedEmpty">
                No matching reports
                for this location.
              </div>
            )}

          {!loading &&
            !error &&
            selectedArticles.map(
              (article) => (
                <article
                  key={article.id}
                  className="liveFeedRow"
                >
                  <div className="liveFeedTime">
                    {formatTime(
                      article.date
                    )}
                  </div>

                  <div className="liveFeedBody">
                    <div className="feedMeta">
                      {
                        article.category
                      }
                      {" · "}
                      {
                        article.source
                      }
                    </div>

                    <a
                      href={
                        article.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="liveFeedTitle"
                    >
                      {
                        article.title
                      }
                    </a>
                  </div>

                  <a
                    href={
                      article.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open report"
                  >
                    <ExternalLink
                      size={16}
                    />
                  </a>
                </article>
              )
            )}
        </div>
      </section>
    </main>
  );
}

function MapMetric({
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
