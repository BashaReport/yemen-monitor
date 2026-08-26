"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
  CircleDollarSign,
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

export default function EconomyPage() {
  const [articles, setArticles] =
    useState<Article[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(false);

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
            "Unable to load economic reporting"
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

  const economyArticles =
    useMemo(
      () =>
        articles
          .filter(
            (article) =>
              article.category ===
              "Economy"
          )
          .sort(
            (a, b) =>
              new Date(
                b.date
              ).getTime() -
              new Date(
                a.date
              ).getTime()
          ),
      [articles]
    );

  const energyCount =
    economyArticles.filter(
      (article) => {
        const title =
          article.title.toLowerCase();

        return (
          title.includes("oil") ||
          title.includes("gas") ||
          title.includes("energy") ||
          title.includes("fuel") ||
          title.includes("نفط") ||
          title.includes("غاز") ||
          title.includes("وقود")
        );
      }
    ).length;

  const tradeCount =
    economyArticles.filter(
      (article) => {
        const title =
          article.title.toLowerCase();

        return (
          title.includes("trade") ||
          title.includes("export") ||
          title.includes("import") ||
          title.includes("shipping") ||
          title.includes("تجارة") ||
          title.includes("صادرات") ||
          title.includes("واردات")
        );
      }
    ).length;

  const currencyCount =
    economyArticles.filter(
      (article) => {
        const title =
          article.title.toLowerCase();

        return (
          title.includes("currency") ||
          title.includes("rial") ||
          title.includes("inflation") ||
          title.includes("exchange rate") ||
          title.includes("عملة") ||
          title.includes("الريال") ||
          title.includes("تضخم")
        );
      }
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
              ECONOMIC INTELLIGENCE
            </div>

            <h1>
              Yemen Economy
            </h1>

            <p>
              Economic reporting on
              energy, trade, currency,
              infrastructure and major
              financial developments.
            </p>
          </div>
        </div>

        <div className="metricsGrid">
          <Metric
            label="Economic reports"
            value={String(
              economyArticles.length
            )}
            detail="Current monitored feed"
          />

          <Metric
            label="Energy"
            value={String(
              energyCount
            )}
            detail="Oil, gas and fuel"
          />

          <Metric
            label="Trade"
            value={String(
              tradeCount
            )}
            detail="Imports and exports"
          />

          <Metric
            label="Currency"
            value={String(
              currencyCount
            )}
            detail="Rial and inflation"
          />
        </div>

        <div
          className="liveFeedResults"
          style={{
            marginTop: "14px",
          }}
        >
          <div className="feedResultsHeader">
            <span>
              Latest economic reporting
            </span>

            <span>
              {
                economyArticles.length
              }{" "}
              reports
            </span>
          </div>

          {loading && (
            <div className="liveFeedEmpty">
              Loading economic reporting...
            </div>
          )}

          {error && (
            <div className="liveFeedEmpty">
              Unable to load economic reporting.
            </div>
          )}

          {!loading &&
            !error &&
            economyArticles.length ===
              0 && (
              <div className="liveFeedEmpty">
                No economic reports available.
              </div>
            )}

          {!loading &&
            !error &&
            economyArticles.map(
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
                      ECONOMY
                      {" · "}
                      {
                        article.source
                      }
                      {" · "}
                      RELEVANCE{" "}
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
                    aria-label="Open economic report"
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

function Metric({
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
      <div className="metricIcon">
        <CircleDollarSign
          size={18}
        />
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
