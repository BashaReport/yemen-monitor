"use client";

import Image from "next/image";
import {
  Activity,
  Bell,
  ChevronDown,
  CircleDot,
  Clock3,
  Globe2,
  MapPinned,
  Menu,
  Search,
  ShieldAlert,
  Ship,
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
};

type NewsResponse = {
  updatedAt: string;
  count: number;
  articles: Article[];
};

const categories = [
  "All",
  "Security",
  "Maritime",
  "Politics",
  "Humanitarian",
  "Economy",
  "General",
];

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    async function loadNews() {
      try {
        const response = await fetch("/api/news", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("News request failed");
        }

        const data: NewsResponse = await response.json();

        setArticles(data.articles || []);
        setUpdatedAt(data.updatedAt || "");
        setError(false);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadNews();

    const interval = window.setInterval(
      loadNews,
      300000
    );

    return () => window.clearInterval(interval);
  }, []);

  const filteredArticles = useMemo(() => {
    if (activeCategory === "All") {
      return articles;
    }

    return articles.filter(
      (article) => article.category === activeCategory
    );
  }, [articles, activeCategory]);

  const maritimeCount = useMemo(
    () =>
      articles.filter(
        (article) => article.category === "Maritime"
      ).length,
    [articles]
  );

  const securityCount = useMemo(
    () =>
      articles.filter(
        (article) => article.category === "Security"
      ).length,
    [articles]
  );

  const humanitarianCount = useMemo(
    () =>
      articles.filter(
        (article) => article.category === "Humanitarian"
      ).length,
    [articles]
  );

  const latestArticles = filteredArticles.slice(0, 12);

  const formattedUpdate = updatedAt
    ? new Date(updatedAt).toLocaleTimeString(
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
            <ChevronDown size={14} />
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

        {[
          "Overview",
          "Live Feed",
          "Map",
          "Maritime",
          "Politics",
          "Humanitarian",
          "Economy",
          "Sources",
          "Briefings",
        ].map((item, index) => (
          <a
            className={
              index === 0
                ? "activeNav"
                : ""
            }
            key={item}
            href="#"
          >
            {item}
          </a>
        ))}
      </nav>

      <section className="statusStrip">
        <div className="live">
          <span className="liveDot" />
          LIVE MONITORING
        </div>

        <div className="statusItem">
          <Clock3 size={14} />
          Updated {formattedUpdate}
        </div>

        <div className="statusItem">
          <Globe2 size={14} />
          Yemen + Red Sea
        </div>

        <div className="statusItem">
          <CircleDot size={14} />
          {articles.length} live reports
        </div>
      </section>

      <section className="hero">
        <div>
          <div className="eyebrow">
            SITUATION OVERVIEW
          </div>

          <h1>Yemen Monitor</h1>

          <p>
            Independent monitoring and analysis of
            developments in Yemen and the Red Sea.
          </p>
        </div>

        <div className="heroControls">
          <button className="filterButton">
            Last 24 hours
            <ChevronDown size={15} />
          </button>
        </div>
      </section>

      <section className="metricsGrid">
        <Metric
          icon={<ShieldAlert size={18} />}
          label="Security reports"
          value={String(securityCount)}
          detail="Last 24 hours"
        />

        <Metric
          icon={<Activity size={18} />}
          label="News volume"
          value={String(articles.length)}
          detail="Live monitored reports"
        />

        <Metric
          icon={<Ship size={18} />}
          label="Maritime reports"
          value={String(maritimeCount)}
          detail="Red Sea and Gulf of Aden"
        />

        <Metric
          icon={<MapPinned size={18} />}
          label="Humanitarian"
          value={String(humanitarianCount)}
          detail="Current reporting"
        />
      </section>

      <section className="card filterCard">
        <div className="eyebrow">
          FILTER LIVE FEED
        </div>

        <div className="categoryFilters">
          {categories.map((category) => {
            const count =
              category === "All"
                ? articles.length
                : articles.filter(
                    (article) =>
                      article.category === category
                  ).length;

            return (
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
                <span>{count}</span>
              </button>
            );
          })}
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
                {activeCategory === "All"
                  ? "Live Yemen intelligence feed"
                  : `${activeCategory} reporting`}
              </h2>
            </div>

            <span className="goldPill">
              {filteredArticles.length} reports
            </span>
          </div>

          <div className="feedList">
            {loading && (
              <div className="feedItem">
                Loading live reports...
              </div>
            )}

            {error && (
              <div className="feedItem">
                Unable to load live reporting.
              </div>
            )}

            {!loading &&
              !error &&
              latestArticles.length === 0 && (
                <div className="feedItem">
                  No reports in this category right now.
                </div>
              )}

            {!loading &&
              !error &&
              latestArticles.map((article) => (
                <article
                  className="feedItem"
                  key={article.id}
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
                      {article.category}
                      {" · "}
                      {article.source}
                      {" · "}
                      Relevance{" "}
                      {article.relevance}
                    </div>

                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="feedTitle"
                    >
                      {article.title}
                    </a>
                  </div>
                </article>
              ))}
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
          </div>

          <div className="mapMock">
            <div className="mapLabel sanaa">
              Sana&apos;a
            </div>

            <div className="mapLabel hodeidah">
              Hudaydah
            </div>

            <div className="mapLabel aden">
              Aden
            </div>

            <div className="mapLabel marib">
              Marib
            </div>

            <span className="marker m1" />
            <span className="marker m2" />
            <span className="marker m3" />
            <span className="marker m4" />
            <span className="marker m5" />

            <div className="watermark">
              YEMEN
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div>
          Basha Report · Yemen Monitor
        </div>

        <div>
          Independent monitoring and analysis
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

  const parsed = new Date(date);

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

function getSeverity(
  article: Article
) {
  if (article.relevance >= 10) {
    return "high";
  }

  if (article.relevance >= 6) {
    return "medium";
  }

  return "low";
}
