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

type BlueskySession = {
  accessJwt: string;
  refreshJwt: string;
  did: string;
  handle: string;
};

const searches = [
  "Yemen",
  "Houthis",
  "Sanaa",
  "Aden",
  "Red Sea",
];

function inferTopic(text: string) {
  const value = text.toLowerCase();

  if (
    value.includes("red sea") ||
    value.includes("ship") ||
    value.includes("tanker") ||
    value.includes("vessel") ||
    value.includes("bab al-mandab") ||
    value.includes("bab el-mandeb")
  ) {
    return "Maritime";
  }

  if (
    value.includes("houthi") ||
    value.includes("attack") ||
    value.includes("strike") ||
    value.includes("missile") ||
    value.includes("drone") ||
    value.includes("clash") ||
    value.includes("shelling")
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
    value.includes("political") ||
    value.includes("diplomat")
  ) {
    return "Politics";
  }

  return "General";
}

function buildPostUrl(
  handle: string,
  uri: string
) {
  const parts = uri.split("/");
  const rkey = parts[parts.length - 1];

  return `https://bsky.app/profile/${handle}/post/${rkey}`;
}

async function createBlueskySession(): Promise<BlueskySession> {
  const identifier =
    process.env.BLUESKY_IDENTIFIER;

  const password =
    process.env.BLUESKY_APP_PASSWORD;

  if (!identifier || !password) {
    throw new Error(
      "Bluesky environment variables are missing"
    );
  }

  const response = await fetch(
    "https://bsky.social/xrpc/com.atproto.server.createSession",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Accept:
          "application/json",
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
      cache: "no-store",
    }
  );

  const text =
    await response.text();

  if (!response.ok) {
    console.error(
      "Bluesky login failed",
      response.status,
      text
    );

    throw new Error(
      `Bluesky login failed with ${response.status}`
    );
  }

  return JSON.parse(
    text
  ) as BlueskySession;
}

async function searchBluesky(
  query: string,
  accessJwt: string
): Promise<SocialItem[]> {
  const url =
    "https://bsky.social/xrpc/app.bsky.feed.searchPosts?q=" +
    encodeURIComponent(query) +
    "&limit=25&sort=latest";

  try {
    const response =
      await fetch(
        url,
        {
          headers: {
            Authorization:
              `Bearer ${accessJwt}`,
            Accept:
              "application/json",
          },
          cache: "no-store",
        }
      );

    const text =
      await response.text();

    if (!response.ok) {
      console.error(
        "Bluesky search failed",
        query,
        response.status,
        text
      );

      return [];
    }

    const data =
      JSON.parse(text);

    const posts =
      data?.posts || [];

    return posts.map(
      (post: any) => {
        const postText =
          post?.record?.text ||
          "";

        const handle =
          post?.author?.handle ||
          "";

        const displayName =
          post?.author?.displayName ||
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

          text:
            postText,

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
            inferTopic(
              postText
            ),

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
      "Bluesky search error",
      query,
      error
    );

    return [];
  }
}

export async function GET() {
  try {
    const session =
      await createBlueskySession();

    const results =
      await Promise.all(
        searches.map(
          (query) =>
            searchBluesky(
              query,
              session.accessJwt
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

      authenticatedAs:
        session.handle,

      count:
        items.length,

      providers: {
        bluesky:
          items.length,
        reddit: 0,
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
          error instanceof Error
            ? error.message
            : "Unable to load social content",
        items: [],
      },
      {
        status: 200,
      }
    );
  }
}
