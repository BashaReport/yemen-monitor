"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
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
  provider?: string;
};

type NewsResponse = {
  updatedAt: string;
  count: number;
  articles: Article[];
};

export default function MaritimePage() {
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
            "Unable to load maritime reporting"
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

  const maritimeArticles =
    useMemo(
      () =>
        articles
          .filter(
            (article) =>
              article.category ===
              "Maritime"
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

  const highRelevance =
    maritimeArticles.filter(
      (article) =>
        article.relevance >= 10
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
              MARITIME INTELLIGENCE
            </div>

            <h1>
              Red Sea & Gulf of Aden
            </h1>

            <p>
              Maritime reporting on shipping,
              vessels, ports, attacks and
              strategic waterways around Yemen.
            </p>
          </div>
        </div>

        <div className="metricsGrid">
          <Metric
            label="Maritime reports"
            value={String(
              maritimeArticles.length
            )}
            detail="Current monitored feed"
          />

          <Metric
            label="High relevance"
            value={String(
              highRelevance
            )}
            detail="Relevance 10 or higher"
          />

          <Metric
            label="Red Sea focus"
            value={String(
              maritimeArticles.filter(
                (article) =>
                  article.title
                    .toLowerCase()
                    .includes(
                      "red sea"
                    )
              ).length
            )}
            detail="Reports naming Red Sea"
          />

          <Metric
            label="Gulf of Aden"
            value={String(
              maritimeArticles.filter(
                (article) =>
                  article.title
                    .toLowerCase()
                    .includes(
                      "gulf of aden"
                    )
              ).length
            )}
            detail="Reports naming Gulf of Aden"
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
              Latest maritime reporting
            </span>

            <span>
              {
                maritimeArticles.length
              }{" "}
              reports
            </span>
          </div>

          {loading && (
            <div className="liveFeedEmpty">
              Loading maritime reporting...
            </div>
          )}

          {error && (
            <div className="liveFeedEmpty">
              Unable to load maritime reporting.
            </div>
          )}

          {!loading &&
            !error &&
            maritimeArticles.length ===
              0 && (
              <div className="liveFeedEmpty">
                No maritime reports available.
              </div>
            )}

          {!loading &&
            !error &&
            maritimeArticles.map(
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
                      MARITIME
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
                    aria-label="Open maritime report"
                  >
                    <ExternalLink
                      size={16}
                    />
                  </a>
                </article>
              )
            )}
        </div>

        <div
          style={{
            marginTop: "14px",
          }}
        >
          <Link
            href="/map"
            className="goldPill"
          >
            <Ship size={14} />
            View maritime activity on map
          </Link>
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
        <Ship size={18} />
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
