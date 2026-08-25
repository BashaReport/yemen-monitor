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
  lat: number;
  lon: number;
  keywords: string[];
};

type MappedIncident = {
  article: Article;
  location: LocationItem;
};

const MAP_BOUNDS = {
  west: 41,
  east: 56,
  south: 10,
  north: 20,
};

const monitoredLocations: LocationItem[] = [
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

function mapPosition(
  location: LocationItem
) {
  const left =
    ((location.lon -
      MAP_BOUNDS.west) /
      (MAP_BOUNDS.east -
        MAP_BOUNDS.west)) *
    100;

  const top =
    ((MAP_BOUNDS.north -
      location.lat) /
      (MAP_BOUNDS.north -
        MAP_BOUNDS.south)) *
    100;

  return {
    left: `${left}%`,
    top: `${top}%`,
  };
}

function markerColor(
  category: string
) {
  if (category === "Security") {
    return "#8a2b25";
  }

  if (category === "Maritime") {
    return "#31566b";
  }

  if (
    category === "Humanitarian"
  ) {
    return "#8a6b24";
  }

  if (category === "Politics") {
    return "#665071";
  }

  return "#a86604";
}

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

  const [
    selectedIncident,
    setSelectedIncident,
  ] =
    useState<MappedIncident | null>(
      null
    );

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

  const mappedIncidents =
    useMemo(() => {
      const mapped: MappedIncident[] =
        [];

      articles.forEach(
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
    }, [articles]);

  const visibleIncidents =
    useMemo(() => {
      if (
        selectedLocation === "All"
      ) {
        return mappedIncidents;
      }

      return mappedIncidents.filter(
        (incident) =>
          incident.location.name ===
          selectedLocation
      );
    }, [
      mappedIncidents,
      selectedLocation,
    ]);

  const locationCounts =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      monitoredLocations.forEach(
        (location) => {
          counts[location.name] =
            mappedIncidents.filter(
              (incident) =>
                incident.location
                  .name ===
                location.name
            ).length;
        }
      );

      return counts;
    }, [mappedIncidents]);

  const selectedArticles =
    useMemo(() => {
      if (
        selectedLocation === "All"
      ) {
        return mappedIncidents
          .map(
            (incident) =>
              incident.article
          )
          .sort(
            (a, b) =>
              new Date(
                b.date
              ).getTime() -
              new Date(
                a.date
              ).getTime()
          )
          .slice(0, 12);
      }

      return mappedIncidents
        .filter(
          (incident) =>
            incident.location.name ===
            selectedLocation
        )
        .map(
          (incident) =>
            incident.article
        )
        .slice(0, 12);
    }, [
      mappedIncidents,
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
              GEOGRAPHIC MONITORING
            </div>

            <h1>Yemen Map</h1>

            <p>
              Live geographic view of
              reporting across Yemen,
              the Red Sea and Gulf of
              Aden.
            </p>
          </div>
        </div>

        <div className="metricsGrid">
          <MapMetric
            icon={
              <MapPin size={18} />
            }
            label="Mapped incidents"
            value={String(
              mappedIncidents.length
            )}
            detail="Reports with location matches"
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
            label="Locations"
            value={String(
              monitoredLocations.length
            )}
            detail="Monitored areas"
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
                  LIVE INCIDENT MAP
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
                position:
                  "relative",
                overflow:
                  "hidden",
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
                  pointerEvents:
                    "none",
                }}
                loading="lazy"
              />

              {visibleIncidents.map(
                (
                  incident,
                  index
                ) => {
                  const position =
                    mapPosition(
                      incident.location
                    );

                  const offset =
                    index % 5;

                  return (
                    <button
                      key={`${incident.article.id}-${incident.location.name}`}
                      aria-label={`Open ${incident.article.title}`}
                      title={
                        incident.article
                          .title
                      }
                      onClick={() =>
                        setSelectedIncident(
                          incident
                        )
                      }
                      style={{
                        position:
                          "absolute",
                        left:
                          position.left,
                        top:
                          position.top,
                        transform: `translate(${offset *
                          3 -
                          6}px, ${
                          offset *
                            2 -
                          10
                        }px)`,
                        width:
                          incident.article
                            .relevance >=
                          10
                            ? "17px"
                            : "13px",
                        height:
                          incident.article
                            .relevance >=
                          10
                            ? "17px"
                            : "13px",
                        borderRadius:
                          "50%",
                        border:
                          "2px solid #fff8ed",
                        background:
                          markerColor(
                            incident
                              .article
                              .category
                          ),
                        boxShadow:
                          "0 0 0 4px rgba(50,3,3,0.10)",
                        cursor:
                          "pointer",
                        zIndex: 4,
                      }}
                    />
                  );
                }
              )}

              <div
                style={{
                  position:
                    "absolute",
                  left: "15px",
                  bottom: "15px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  padding:
                    "8px 10px",
                  borderRadius:
                    "8px",
                  background:
                    "rgba(248,242,233,0.92)",
                  border:
                    "1px solid rgba(50,3,3,0.12)",
                  fontSize:
                    "10px",
                  zIndex: 5,
                }}
              >
                <Legend
                  color="#8a2b25"
                  label="Security"
                />

                <Legend
                  color="#31566b"
                  label="Maritime"
                />

                <Legend
                  color="#8a6b24"
                  label="Humanitarian"
                />

                <Legend
                  color="#665071"
                  label="Politics"
                />

                <Legend
                  color="#a86604"
                  label="Other"
                />
              </div>
            </div>

            {selectedIncident && (
              <div
                style={{
                  marginTop:
                    "14px",
                  padding:
                    "16px",
                  border:
                    "1px solid rgba(50, 3, 3, 0.12)",
                  borderRadius:
                    "10px",
                  background:
                    "rgba(255,255,255,0.35)",
                }}
              >
                <div className="feedMeta">
                  {
                    selectedIncident
                      .location.name
                  }
                  {" · "}
                  {
                    selectedIncident
                      .article.category
                  }
                  {" · "}
                  {
                    selectedIncident
                      .article.source
                  }
                </div>

                <a
                  href={
                    selectedIncident
                      .article.url
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="liveFeedTitle"
                >
                  {
                    selectedIncident
                      .article.title
                  }
                </a>

                <div
                  style={{
                    marginTop:
                      "9px",
                  }}
                >
                  <a
                    href={
                      selectedIncident
                        .article.url
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="backLink"
                    style={{
                      marginBottom: 0,
                    }}
                  >
                    Open report
                    <ExternalLink
                      size={13}
                    />
                  </a>
                </div>
              </div>
            )}
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
              onClick={() => {
                setSelectedLocation(
                  "All"
                );

                setSelectedIncident(
                  null
                );
              }}
            >
              All locations

              <span>
                {
                  mappedIncidents.length
                }
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
                    onClick={() => {
                      setSelectedLocation(
                        location.name
                      );

                      setSelectedIncident(
                        null
                      );
                    }}
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
                      cursor:
                        "pointer",
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
                ? "Mapped reports"
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

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span
      style={{
        display:
          "inline-flex",
        alignItems:
          "center",
        gap: "5px",
      }}
    >
      <span
        style={{
          width: "8px",
          height: "8px",
          borderRadius:
            "50%",
          background:
            color,
        }}
      />

      {label}
    </span>
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
