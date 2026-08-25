
import { NextResponse } from "next/server";

type SocialItem = {
  id: string;
  platform: string;
  account: string;
  handle: string;
  text: string;
  url: string;
  date: string;
  topic: string;
  language: string;
  status: string;
};

const REDDIT_URL =
  "https://www.reddit.com/search.json?q=" +
  encodeURIComponent(
    'Yemen OR Houthis OR Sanaa OR Aden OR "Red Sea"'
  ) +
  "&sort=new&t=day&limit=25";

function inferTopic(
  title: string
) {
  const text =
    title.toLowerCase();

  if (
    text.includes("red sea") ||
    text.includes("ship") ||
    text.includes("tanker") ||
    text.includes("vessel") ||
    text.includes("bab al-mandab")
  ) {
    return "Maritime";
  }

  if (
    text.includes("houthi") ||
    text.includes("attack") ||
    text.includes("strike") ||
    text.includes("missile") ||
    text.includes("drone") ||
    text.includes("clash")
  ) {
    return "Security";
  }

  if (
    text.includes("aid") ||
    text.includes("humanitarian") ||
    text.includes("food") ||
    text.includes("health") ||
    text.includes("displacement")
  ) {
    return "Humanitarian";
  }

  if (
    text.includes("government") ||
    text.includes("minister") ||
    text.includes("president") ||
    text.includes("political")
  ) {
    return "Politics";
  }

  return "General";
}

export async function GET() {
  try {
    const response =
      await fetch(
        REDDIT_URL,
        {
          headers: {
            "User-Agent":
              "BashaReport-YemenMonitor/1.0",
          },
          next: {
            revalidate: 300,
          },
        }
      );

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Reddit request failed",
          status:
            response.status,
          items: [],
        },
        {
          status: 200,
        }
      );
    }

    const data =
      await response.json();

    const children =
      data?.data?.children || [];

    const items: SocialItem[] =
      children
        .map(
          (entry: any) => {
            const post =
              entry?.data;

            if (!post) {
              return null;
            }

            const title =
              post.title || "";

            return {
              id:
                post.id ||
                crypto.randomUUID(),
              platform:
                "Reddit",
              account:
                post.subreddit_name_prefixed ||
                "Reddit",
              handle:
                post.author
                  ? `u/${post.author}`
                  : "Reddit",
              text:
                title,
              url:
                post.permalink
                  ? `https://www.reddit.com${post.permalink}`
                  : "https://www.reddit.com/",
              date:
                post.created_utc
                  ? new Date(
                      post.created_utc *
                        1000
                    ).toISOString()
                  : new Date().toISOString(),
              topic:
                inferTopic(
                  title
                ),
              language:
                "English",
              status:
                "UNVERIFIED",
            };
          }
        )
        .filter(Boolean)
        .slice(
          0,
          25
        ) as SocialItem[];

    return NextResponse.json({
      ok: true,
      updatedAt:
        new Date().toISOString(),
      count:
        items.length,
      providers: {
        reddit:
          items.length,
      },
      items,
    });
  } catch (error) {
    console.error(
      "Social API error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load social content",
        items: [],
      },
      {
        status: 200,
      }
    );
  }
}
