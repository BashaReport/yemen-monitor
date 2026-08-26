"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeft,
  ExternalLink,
  HeartHandshake,
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

export default function HumanitarianPage() {
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
            "Unable to load humanitarian reporting"
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

  const humanitarianArticles =
    useMemo(
      () =>
        articles
          .filter(
            (article) =>
              article.category ===
              "Humanitarian"
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

  const reliefWebCount =
    humanitarianArticles.filter(
      (article) =>
        article.provider ===
        "ReliefWeb"
    ).length;

  const foodCount =
    humanitarianArticles.filter(
      (article) => {
        const title =
          article.title.toLowerCase();

        return (
          title.includes("food") ||
          title.includes("famine") ||
          title.includes("nutrition") ||
          title.includes("غذاء") ||
          title.includes("مجاعة") ||
          title.includes("تغذية")
        );
      }
    ).length;

  const healthCount =
    humanitarianArticles.filter(
      (article) => {
        const title =
          article.title.toLowerCase();

        return (
          title.includes("health") ||
          title.includes("hospital") ||
          title.includes("disease") ||
          title.includes("cholera") ||
          title.includes("صحة") ||
          title.includes("مستشفى") ||
          title.includes("كوليرا")
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
              HUMANITARIAN INTELLIGENCE
            </div>

            <h1>
              Yemen Humanitarian
            </h1>

            <p>
              Humanitarian reporting on
              displacement, food security,
              health, aid and civilian needs.
            </p>
          </div>
        </div>

        <div className="metricsGrid">
          <Metric
            label="Humanitarian reports"
            value={String(
              humanitarianArticles.length
            )}
            detail="Current monitored feed"
          />

          <Metric
            label="ReliefWeb"
            value={String(
              reliefWebCount
            )}
            detail="Direct ReliefWeb reports"
          />

          <Metric
            label="Food security"
            value={String(
              foodCount
            )}
            detail="Food and nutrition reporting"
          />

          <Metric
            label="Health"
            value={String(
              healthCount
            )}
            detail="Health-related reporting"
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
              Latest humanitarian reporting
            </span>

            <span>
              {
                humanitarianArticles.length
              }{" "}
              reports
            </span>
          </div>

          {loading && (
            <div className="liveFeedEmpty">
              Loading humanitarian reporting...
            </div>
          )}

          {error && (
            <div className="liveFeedEmpty">
              Unable to load humanitarian reporting.
            </div>
          )}

          {!loading &&
            !error &&
            humanitarianArticles.length ===
              0 && (
              <div className="liveFeedEmpty">
                No humanitarian reports available.
              </div>
            )}

          {!loading &&
            !error &&
            humanitarianArticles.map(
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
                      HUMANITARIAN
                      {" · "}
                      {
                        article.source
                      }

                      {article.provider ===
                        "ReliefWeb" && (
                        <>
                          {" · "}
                          DIRECT RELIEFWEB
                        </>
                      )}

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
                    aria-label="Open humanitarian report"
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
        <HeartHandshake
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
