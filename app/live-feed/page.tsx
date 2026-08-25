"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  Search,
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
  googleCount?: number;
  reliefWebCount?: number;
  reliefWebFetched?: number;
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

const providerOptions = [
  "All",
  "Google News",
  "ReliefWeb",
];

export default function LiveFeedPage() {
  const [articles, setArticles] =
    useState<Article[]>([]);

  const [
    activeCategory,
    setActiveCategory,
  ] = useState("All");

  const [search, setSearch] =
    useState("");

  const [
    selectedSource,
    setSelectedSource,
  ] = useState("All");

  const [
    selectedProvider,
    setSelectedProvider,
  ] = useState("All");

  const [
    selectedHours,
    setSelectedHours,
  ] = useState(24);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

  useEffect(() => {
    async function loadNews() {
      try {
        const response = await fetch(
          "/api/news",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load news"
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

  const sources = useMemo(() => {
    const unique =
      Array.from(
        new Set(
          articles
            .map(
              (article) =>
                article.source
            )
            .filter(Boolean)
        )
      );

    return unique.sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [articles]);

  const filtered =
    useMemo(() => {
      const cutoff =
        Date.now() -
        selectedHours *
          60 *
          60 *
          1000;

      const query =
        search
          .toLowerCase()
          .trim();

      return articles.filter(
        (article) => {
          const articleTime =
            new Date(
              article.date
            ).getTime();

          const matchesTime =
            !Number.isNaN(
              articleTime
            ) &&
            articleTime >=
              cutoff;

          const matchesCategory =
            activeCategory ===
              "All" ||
            article.category ===
              activeCategory;

          const matchesSource =
            selectedSource ===
              "All" ||
            article.source ===
              selectedSource;

          const matchesProvider =
            selectedProvider ===
              "All" ||
            article.provider ===
              selectedProvider;

          const matchesSearch =
            !query ||
            article.title
              .toLowerCase()
              .includes(query) ||
            article.source
              .toLowerCase()
              .includes(query) ||
            article.category
              .toLowerCase()
              .includes(query) ||
            (
              article.provider ||
              ""
            )
              .toLowerCase()
              .includes(query);

          return (
            matchesTime &&
            matchesCategory &&
            matchesSource &&
            matchesProvider &&
            matchesSearch
          );
        }
      );
    }, [
      articles,
      activeCategory,
      selectedSource,
      selectedProvider,
      selectedHours,
      search,
    ]);

  const reliefWebVisible =
    useMemo(
      () =>
        filtered.filter(
          (article) =>
            article.provider ===
            "ReliefWeb"
        ).length,
      [filtered]
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
              LIVE MONITORING
            </div>

            <h1>
              Live Feed
            </h1>

            <p>
              Current reporting on
              Yemen and the Red Sea
              from monitored sources.
            </p>
          </div>

          <div className="feedSearch">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search reports or sources"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        <div className="liveFeedControls">
          <div className="categoryFilters">
            {categories.map(
              (category) => (
                <button
                  key={category}
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
                    {category ===
                    "All"
                      ? articles.length
                      : articles.filter(
                          (
                            article
                          ) =>
                            article.category ===
                            category
                        ).length}
                  </span>
                </button>
              )
            )}
          </div>

          <div className="secondaryFilters">
            <label className="selectWrap">
              <span>
                Provider
              </span>

              <div className="selectBox">
                <select
                  value={
                    selectedProvider
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedProvider(
                      event.target
                        .value
                    )
                  }
                >
                  {providerOptions.map(
                    (provider) => (
                      <option
                        key={
                          provider
                        }
                        value={
                          provider
                        }
                      >
                        {provider ===
                        "All"
                          ? "All providers"
                          : provider}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={14}
                />
              </div>
            </label>

            <label className="selectWrap">
              <span>
                Source
              </span>

              <div className="selectBox">
                <select
                  value={
                    selectedSource
                  }
                  onChange={(
                    event
                  ) =>
                    setSelectedSource(
                      event.target
                        .value
                    )
                  }
                >
                  <option value="All">
                    All sources
                  </option>

                  {sources.map(
                    (source) => (
                      <option
                        key={
                          source
                        }
                        value={
                          source
                        }
                      >
                        {source}
                      </option>
                    )
                  )}
                </select>

                <ChevronDown
                  size={14}
                />
              </div>
            </label>

            <label className="selectWrap">
              <span>
                Time
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
        </div>

        <div className="liveFeedResults">
          <div className="feedResultsHeader">
            <span>
              {filtered.length} reports
            </span>

            <span>
              {reliefWebVisible > 0
                ? `${reliefWebVisible} direct ReliefWeb · `
                : ""}
              Last {selectedHours}h
            </span>
          </div>

          {loading && (
            <div className="liveFeedEmpty">
              Loading reports...
            </div>
          )}

          {error && (
            <div className="liveFeedEmpty">
              Unable to load current
              reporting.
            </div>
          )}

          {!loading &&
            !error &&
            filtered.length ===
              0 && (
              <div className="liveFeedEmpty">
                No matching reports.
              </div>
            )}

          {!loading &&
            !error &&
            filtered.map(
              (article) => (
                <article
                  className="liveFeedRow"
                  key={article.id}
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

                      {article.provider ===
                        "ReliefWeb" && (
                        <>
                          {" · "}
                          <span className="reliefWebLabel">
                            DIRECT RELIEFWEB
                          </span>
                        </>
                      )}
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

                  <div
                    className="relevanceBadge"
                    title="Relevance score"
                  >
                    {
                      article.relevance
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
