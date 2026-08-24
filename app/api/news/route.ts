import { NextResponse } from "next/server";

type NewsItem = {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category: string;
};

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

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, "$1")
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

function parseFeed(xml: string, category: string): NewsItem[] {
  const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  return items.map((item) => {
    let source = getTag(item, "source");
    let title = getTag(item, "title");

    if (!source && title.includes(" - ")) {
      const parts = title.split(" - ");
      source = parts.pop() || "Google News";
      title = parts.join(" - ");
    }

    return {
      title,
      link: getTag(item, "link"),
      pubDate: getTag(item, "pubDate"),
      source: source || "Google News",
      category,
    };
  });
}

async function fetchSearch(
  query: string,
  category: string
): Promise<NewsItem[]> {
  const url =
    "https://news.google.com/rss/search?q=" +
    encodeURIComponent(query) +
    "&hl=en-US&gl=US&ceid=US:en";

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 BashaReport YemenMonitor",
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      console.error(
        "Google News request failed",
        response.status,
        query
      );

      return [];
    }

    const xml = await response.text();

    return parseFeed(xml, category);
  } catch (error) {
    console.error(
      "Google News fetch error",
      query,
      error
    );

    return [];
  }
}

export async function GET() {
  try {
    const results = await Promise.all(
      searches.map((search) =>
        fetchSearch(
          search.query,
          search.category
        )
      )
    );

    const combined = results.flat();

    const seen = new Set<string>();

    const articles = combined
      .filter((article) => {
        const key = article.title
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

        if (!key || seen.has(key)) {
          return false;
        }

        seen.add(key);
        return true;
      })
      .sort((a, b) => {
        return (
          new Date(b.pubDate).getTime() -
          new Date(a.pubDate).getTime()
        );
      })
      .slice(0, 50)
      .map((article, index) => ({
        id: index + 1,
        title: article.title,
        url: article.link,
        date: article.pubDate,
        source: article.source,
        category: article.category,
      }));

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error(
      "Yemen Google News API error",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load Yemen news",
        articles: [],
      },
      {
        status: 500,
      }
    );
  }
}
