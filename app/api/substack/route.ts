import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const FEED_URL =
  "https://bashareport.substack.com/feed";

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripHtml(value: string) {
  return decodeXml(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getTag(xml: string, tag: string) {
  const escapedTag = tag.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const match = xml.match(
    new RegExp(
      `<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`,
      "i"
    )
  );

  return match ? decodeXml(match[1]).trim() : "";
}

function getImage(item: string) {
  const enclosure = item.match(
    /<enclosure[^>]+url=["']([^"']+)["']/i
  );

  if (enclosure) {
    return decodeXml(enclosure[1]);
  }

  const media = item.match(
    /<media:content[^>]+url=["']([^"']+)["']/i
  );

  if (media) {
    return decodeXml(media[1]);
  }

  const html =
    getTag(item, "content:encoded") ||
    getTag(item, "description");

  const image = html.match(
    /<img[^>]+src=["']([^"']+)["']/i
  );

  return image ? decodeXml(image[1]) : "";
}

export async function GET() {
  try {
    const response = await fetch(FEED_URL, {
      headers: {
        "User-Agent":
          "BashaReport-YemenMonitor/1.0",
        Accept:
          "application/rss+xml, application/xml, text/xml",
      },

      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      console.error(
        "Substack feed error",
        response.status
      );

      return NextResponse.json(
        {
          ok: false,
          posts: [],
          error:
            "Unable to load Substack feed.",
        },
        {
          status: 502,
        }
      );
    }

    const xml = await response.text();

    const itemMatches =
      xml.match(/<item[\s\S]*?<\/item>/gi) ||
      [];

    const posts = itemMatches
      .map((item, index) => {
        const title = stripHtml(
          getTag(item, "title")
        );

        const link =
          getTag(item, "link");

        const description = stripHtml(
          getTag(item, "description")
        );

        const author =
          stripHtml(
            getTag(item, "dc:creator")
          ) ||
          "Basha Report";

        const published =
          getTag(item, "pubDate");

        const guid =
          getTag(item, "guid");

        const image =
          getImage(item);

        return {
          id:
            guid ||
            link ||
            `substack-${index}`,

          platform: "substack",

          source: "Basha Report",

          author,

          title,

          text: description,

          url: link,

          image,

          publishedAt: published
            ? new Date(
                published
              ).toISOString()
            : null,
        };
      })
      .filter(
        (post) =>
          post.title &&
          post.url
      )
      .slice(0, 20);

    return NextResponse.json({
      ok: true,

      source: {
        name: "Basha Report",
        platform: "Substack",
        url:
          "https://bashareport.substack.com",
      },

      count: posts.length,

      posts,
    });
  } catch (error) {
    console.error(
      "Substack API error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        posts: [],
        error:
          "Unable to load Substack feed.",
      },
      {
        status: 500,
      }
    );
  }
}
