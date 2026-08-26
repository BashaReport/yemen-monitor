"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
  Landmark,
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

export default function PoliticsPage() {
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
            "Unable to load political reporting"
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

  const politicalArticles =
    useMemo(
      () =>
        articles
          .filter(
            (article) =>
              article.category ===
              "Politics"
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
    politicalArticles.filter(
      (article) =>
        article.relevance >= 10
    ).length;

  const governmentCount =
    politicalArticles.filter(
      (article) => {
        const title =
          article.title.toLowerCase();

        return (
          title.includes(
            "government"
          ) ||
          title.includes(
            "minister"
          ) ||
          title.includes(
            "president"
          ) ||
          title.includes(
            "حكومة"
          ) ||
          title.includes(
            "وزير"
          ) ||
          title.includes(
            "رئيس"
          )
        );
      }
    ).length;

  const diplomacyCount =
    politicalArticles.filter(
      (article) => {
        const title =
          article.title.toLowerCase();

        return (
          title.includes(
            "diplomat"
          ) ||
          title.includes(
            "negotiation"
          ) ||
          title.includes(
            "talks"
          ) ||
          title.includes(
            "ceasefire"
          ) ||
          title.includes(
            "مفاوضات"
          ) ||
          title.includes(
            "هدنة"
          )
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
              POLITICAL INTELLIGENCE
            </div>

            <h1>
              Yemen Politics
            </h1>

            <p>
              Political reporting on
              government, diplomacy,
              negotiations and major
              political developments.
            </p>
          </div>
        </div>

        <div className="metricsGrid">
          <Metric
            label="Political reports"
            value={String(
              politicalArticles.length
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
            label="Government"
            value={String(
              governmentCount
            )}
            detail="Government-related reports"
          />

          <Metric
            label="Diplomacy"
            value={String(
              diplomacyCount
            )}
            detail="Talks and negotiations"
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
              Latest political reporting
            </span>

            <span>
              {
                politicalArticles.length
              }{" "}
              reports
            </span>
          </div>

          {loading && (
            <div className="liveFeedEmpty">
              Loading political reporting...
            </div>
          )}

          {error && (
            <div className="liveFeedEmpty">
              Unable to load political reporting.
            </div>
          )}

          {!loading &&
            !error &&
            politicalArticles.length ===
              0 && (
              <div className="liveFeedEmpty">
                No political reports available.
              </div>
            )}

          {!loading &&
            !error &&
            politicalArticles.map(
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
                      POLITICS
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
                    aria-label="Open political report"
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
        <Landmark size={18} />
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
