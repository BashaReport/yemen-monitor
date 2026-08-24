"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
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

export default function LiveFeedPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const response = await fetch("/api/news", {
          cache: "no-store",
        });

        const data: NewsResponse = await response.json();

        setArticles(data.articles || []);
      } catch (error) {
        console.error(error);
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

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === "All" ||
        article.category === activeCategory;

      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        article.title.toLowerCase().includes(query) ||
        article.source.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [articles, activeCategory, search]);

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

            <h1>Live Feed</h1>

            <p>
              Current reporting on Yemen and the Red Sea
              from monitored news sources.
            </p>
          </div>

          <div className="feedSearch">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search reports or sources"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>
        </div>

        <div className="categoryFilters liveFeedFilters">
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
                  ? articles.length
                  : articles.filter(
                      (article) =>
                        article.category === category
                    ).length}
              </span>
            </button>
          ))}
        </div>

        <div className="liveFeedResults">
          <div className="feedResultsHeader">
            <span>
              {filtered.length} reports
            </span>

            <span>
              Newest first
            </span>
          </div>

          {loading && (
            <div className="liveFeedEmpty">
              Loading reports...
            </div>
          )}

          {!loading &&
            filtered.length === 0 && (
              <div className="liveFeedEmpty">
                No matching reports.
              </div>
            )}

          {!loading &&
            filtered.map((article) => (
              <article
                className="liveFeedRow"
                key={article.id}
              >
                <div className="liveFeedTime">
                  {formatTime(article.date)}
                </div>

                <div className="liveFeedBody">
                  <div className="feedMeta">
                    {article.category}
                    {" · "}
                    {article.source}
                  </div>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="liveFeedTitle"
                  >
                    {article.title}
                  </a>
                </div>

                <div className="relevanceBadge">
                  {article.relevance}
                </div>
              </article>
            ))}
        </div>
      </section>
    </main>
  );
}

function formatTime(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
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
