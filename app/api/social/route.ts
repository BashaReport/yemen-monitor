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

const searches = [
  "Yemen",
  "Houthis",
  "Sanaa",
  "Aden",
  "\"Red Sea\"",
];

function inferTopic(text: string) {
  const value =
    text.toLowerCase();

  if (
    value.includes("red sea") ||
    value.includes("ship") ||
    value.includes("tanker") ||
    value.includes("vessel") ||
    value.includes("bab al-mandab")
  ) {
    return "Maritime";
  }

  if (
    value.includes("houthi") ||
    value.includes("attack") ||
    value.includes("strike") ||
    value.includes("missile") ||
    value.includes("drone") ||
    value.includes("clash")
  ) {
    return "Security";
  }

  if (
    value.includes("aid") ||
    value.includes("humanitarian") ||
    value.includes("food") ||
    value.includes("health") ||
    value.includes("displacement")
  ) {
    return "Humanitarian";
  }

  if (
    value.includes("government") ||
    value.includes("minister") ||
    value.includes("president") ||
    value.includes("political")
  ) {
    return "Politics";
  }

  return "General";
}

function buildPostUrl(
  handle: string,
  uri: string
) {
  const parts =
    uri.split("/");

  const rkey =
    parts[
      parts.length - 1
    ];

  return (
    "https://bsky.app/profile/" +
    handle +
    "/post/" +
    rkey
  );
}

async function searchBluesky(
  query: string
): Promise<SocialItem[]> {
  const url =
    "https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts?q=" +
    encodeURIComponent(query) +
    "&limit=25&sort=latest";

  try {
    const response =
      await fetch(
        url,
        {
          headers: {
            Accept:
              "application/json",
          },
          next: {
            revalidate: 300,
          },
        }
      );

    if (!response.ok) {
      console.error(
        "Bluesky request failed",
        query,
        response.status
      );

      return [];
    }

    const data =
      await response.json();

    const posts =
      data?.posts || [];

    return posts.map(
      (post: any) => {
        const text =
          post?.record?.text ||
          "";

        const handle =
          post?.author?.handle ||
          "";

        const displayName =
          post?.author
            ?.displayName ||
          handle ||
          "Bluesky";

        const langs =
          post?.record?.langs;

        return {
          id:
            post?.uri ||
            crypto.randomUUID(),
          platform:
            "Bluesky",
          account:
            displayName,
          handle:
            handle
              ? `@${handle}`
              : "Bluesky",
          text,
          url:
            handle &&
            post?.uri
              ? buildPostUrl(
                  handle,
                  post.uri
                )
              : "https://bsky.app/",
          date:
            post?.record
              ?.createdAt ||
            post?.indexedAt ||
            new Date()
              .toISOString(),
          topic:
            inferTopic(text),
          language:
            Array.isArray(
              langs
            ) &&
            langs.length > 0
              ? langs.join(", ")
              : "Unknown",
          status:
            "UNVERIFIED",
        };
      }
    );
  } catch (error) {
    console.error(
      "Bluesky fetch error",
      query,
      error
    );

    return [];
  }
}

export async function GET() {
  try {
    const results =
      await Promise.all(
        searches.map(
          (query) =>
            searchBluesky(
              query
            )
        )
      );

    const combined =
      results.flat();

    const seen =
      new Set<string>();

    const items =
      combined
        .filter(
          (item) => {
            if (
              !item.text ||
              !item.url
            ) {
              return false;
            }

            if (
              seen.has(
                item.id
              )
            ) {
              return false;
            }

            seen.add(
              item.id
            );

            return true;
          }
        )
        .sort(
          (a, b) =>
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime()
        )
        .slice(
          0,
          50
        );

    return NextResponse.json({
      ok: true,
      updatedAt:
        new Date()
          .toISOString(),
      count:
        items.length,
      providers: {
        bluesky:
          items.length,
        reddit:
          0,
      },
      redditStatus:
        "Awaiting API approval",
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
