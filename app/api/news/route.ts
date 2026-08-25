import { NextResponse } from "next/server";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
  relevance: number;
  provider: string;
};

const RELIEFWEB_URL =
  "https://api.reliefweb.int/v2/reports?appname=BashaReport-YemenMonitor-7Fr389x3K";

const searches = [
  {
    query: "Yemen when:1d",
    category: "General",
  },
  {
    query: "Houthis when:1d",
    category: "Security",
  },
  {
    query: "\"Red Sea\" Yemen when:1d",
    category: "Maritime",
  },
  {
    query: "\"Bab al-Mandab\" when:1d",
    category: "Maritime",
  },
  {
    query: "Aden Yemen when:1d",
    category: "Politics",
  },
  {
    query: "Sanaa Yemen when:1d",
    category: "Politics",
  },
  {
    query: "Yemen humanitarian when:1d",
    category: "Humanitarian",
  },
  {
    query: "Yemen economy when:1d",
    category: "Economy",
  },
];

const strongTerms = [
  "yemen",
  "yemeni",
  "houthi",
  "houthis",
  "ansarallah",
  "sanaa",
  "sana'a",
  "aden",
  "hudaydah",
  "hodeidah",
  "marib",
  "taiz",
  "mukalla",
  "socotra",
  "bab al-mandab",
  "bab el-mandeb",
  "red sea",
  "gulf of aden",
];

const blockedTerms = [
  "football",
  "soccer",
  "cricket",
  "basketball",
  "asian cup",
  "world cup",
  "u20",
  "u-20",
  "coffeehouse",
  "coffee shop",
  "restaurant",
  "recipe",
  "tourism",
  "travel guide",
];

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function getTag(block: string, tag: string) {
  const regex = new RegExp(
    `<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
    "i"
  );

  const match = block.match(regex);

  return match ? decodeXml(match[1].trim()) : "";
}

function cleanTitle(title: string) {
  return title
    .replace(/\s+-\s+[^-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTitle(title: string) {
  return cleanTitle(title)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(
      /\b(the|a|an|of|in|on|to|for|and|with|as|at|say|says|claim|claims|report|reports)\b/g,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function relevanceScore(title: string) {
  const text = title.toLowerCase();

  if (
    blockedTerms.some((term) =>
      text.includes(term)
    )
  ) {
    return -100;
  }

  let score = 0;

  strongTerms.forEach((term) => {
    if (text.includes(term)) {
      score += 3;
    }
  });

  if (
    text.includes("attack") ||
    text.includes("strike") ||
    text.includes("missile") ||
    text.includes("drone") ||
    text.includes("ceasefire") ||
    text.includes("humanitarian") ||
    text.includes("aid") ||
    text.includes("tanker") ||
    text.includes("shipping") ||
    text.includes("port") ||
    text.includes("detention") ||
    text.includes("displacement") ||
    text.includes("food") ||
    text.includes("health") ||
    text.includes("water") ||
    text.includes("negotiation")
  ) {
    score += 1;
  }

  return score;
}

function inferCategory(
  title: string,
  fallback: string
) {
  const text = title.toLowerCase();

  if (
    text.includes("ship") ||
    text.includes("tanker") ||
    text.includes("red sea") ||
    text.includes("bab al-mandab") ||
    text.includes("bab el-mandeb") ||
    text.includes("gulf of aden") ||
    text.includes("maritime") ||
    text.includes("vessel")
  ) {
    return "Maritime";
  }

  if (
    text.includes("humanitarian") ||
    text.includes("unicef") ||
    text.includes("aid") ||
    text.includes("food") ||
    text.includes("famine") ||
    text.includes("relief") ||
    text.includes("displacement") ||
    text.includes("wash") ||
    text.includes("health") ||
    text.includes("immunization") ||
    text.includes("protection")
  ) {
    return "Humanitarian";
  }

  if (
    text.includes("economy") ||
    text.includes("currency") ||
    text.includes("rial") ||
    text.includes("oil price") ||
    text.includes("inflation")
  ) {
    return "Economy";
  }

  if (
    text.includes("government") ||
    text.includes("talks") ||
    text.includes("ceasefire") ||
    text.includes("negotiation") ||
    text.includes("political")
  ) {
    return "Politics";
  }

  if (
    text.includes("missile") ||
    text.includes("drone") ||
    text.includes("attack") ||
    text.includes("strike") ||
    text.includes("military") ||
    text.includes("houthi")
  ) {
    return "Security";
  }

  return fallback;
}

function parseGoogleFeed(
  xml: string,
  category: string
): NewsItem[] {
  const items =
    xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  return items.map((item) => {
    let source = getTag(item, "source");
    let title = getTag(item, "title");

    if (!source && title.includes(" - ")) {
      const parts = title.split(" - ");
      source =
        parts.pop() || "Google News";
      title = parts.join(" - ");
    }

    title = cleanTitle(title);

    return {
      title,
      link: getTag(item, "link"),
      pubDate: getTag(
        item,
        "pubDate"
      ),
      source:
        source || "Google News",
      category: inferCategory(
        title,
        category
      ),
      relevance:
        relevanceScore(title),
      provider: "Google News",
    };
  });
}

async function fetchGoogleSearch(
  query: string,
  category: string
): Promise<NewsItem[]> {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=en-US&gl=US&ceid=US:en";

  try {
    const response = await fetch(
      url,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 BashaReport YemenMonitor",
        },
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Google News request failed",
        response.status,
        query
      );

      return [];
    }

    const xml =
      await response.text();

    return parseGoogleFeed(
      xml,
      category
    );
  } catch (error) {
    console.error(
      "Google News fetch error",
      query,
      error
    );

    return [];
  }
}

async function fetchReliefWeb(): Promise<NewsItem[]> {
  try {
    const response = await fetch(
      RELIEFWEB_URL,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          preset: "latest",
          limit: 30,
          filter: {
            field: "country",
            value: "Yemen",
          },
          fields: {
            include: [
              "title",
              "date.created",
              "source.name",
              "url",
              "url_alias",
            ],
          },
        }),
        next: {
          revalidate: 300,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "ReliefWeb request failed",
        response.status
      );

      return [];
    }

    const data =
      await response.json();

    const items =
      data?.data || [];

    return items
      .map((item: any) => {
        const title =
          item.fields?.title ||
          "Untitled report";

        const url =
          item.fields?.url_alias ||
          item.fields?.url ||
          item.href ||
          "";

        const source =
          item.fields?.source?.[0]
            ?.name ||
          "ReliefWeb";

        return {
          title,
          link: url,
          pubDate:
            item.fields?.date
              ?.created || "",
          source,
          category:
            "Humanitarian",
          relevance: Math.max(
            relevanceScore(title),
            6
          ),
          provider:
            "ReliefWeb",
        };
      })
      .filter(
        (article: NewsItem) => {
          const title =
            article.title.toLowerCase();

          const url =
            article.link.toLowerCase();

          return (
            url.includes(
              "/report/yemen/"
            ) ||
            title.includes("yemen") ||
            title.includes("yemeni")
          );
        }
      );
  } catch (error) {
    console.error(
      "ReliefWeb fetch error",
      error
    );

    return [];
  }
}

export async function GET() {
  try {
    const [
      googleResults,
      reliefWebResults,
    ] = await Promise.all([
      Promise.all(
        searches.map(
          (search) =>
            fetchGoogleSearch(
              search.query,
              search.category
            )
        )
      ),
      fetchReliefWeb(),
    ]);

    const googleArticles =
      googleResults.flat();

    const combined = [
      ...googleArticles,
      ...reliefWebResults,
    ];

    const seen =
      new Set<string>();

    const articles = combined
      .filter((article) => {
        if (
          article.provider ===
            "Google News" &&
          article.relevance < 3
        ) {
          return false;
        }

        const key =
          normalizeTitle(
            article.title
          );

        if (
          !key ||
          seen.has(key)
        ) {
          return false;
        }

        seen.add(key);

        return true;
      })
      .sort((a, b) => {
        const timeA =
          new Date(
            a.pubDate
          ).getTime() || 0;

        const timeB =
          new Date(
            b.pubDate
          ).getTime() || 0;

        return timeB - timeA;
      })
      .slice(0, 70)
      .map(
        (
          article,
          index
        ) => ({
          id: index + 1,
          title:
            article.title,
          url:
            article.link,
          date:
            article.pubDate,
          source:
            article.source,
          category:
            article.category,
          relevance:
            article.relevance,
          provider:
            article.provider,
        })
      );

    const googleCount =
      articles.filter(
        (article) =>
          article.provider ===
          "Google News"
      ).length;

    const reliefWebCount =
      articles.filter(
        (article) =>
          article.provider ===
          "ReliefWeb"
      ).length;

    return NextResponse.json({
      updatedAt:
        new Date().toISOString(),
      count:
        articles.length,
      googleCount,
      reliefWebCount,
      articles,
    });
  } catch (error) {
    console.error(
      "Yemen Monitor API error",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load Yemen reporting",
        articles: [],
      },
      {
        status: 500,
      }
    );
  }
}
