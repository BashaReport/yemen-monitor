import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const USERNAME = "BashaReport";

export async function GET() {
  try {
    const bearerToken =
      process.env.X_BEARER_TOKEN;

    if (!bearerToken) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "X_BEARER_TOKEN is missing.",
          items: [],
        },
        {
          status: 500,
        }
      );
    }

    const userResponse =
      await fetch(
        `https://api.x.com/2/users/by/username/${USERNAME}`,
        {
          headers: {
            Authorization:
              `Bearer ${bearerToken}`,
          },
          cache: "no-store",
        }
      );

    const userData =
      await userResponse.json();

    if (!userResponse.ok) {
      console.error(
        "X user lookup failed",
        userResponse.status,
        userData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to find X account.",
          status:
            userResponse.status,
          items: [],
        },
        {
          status:
            userResponse.status,
        }
      );
    }

    const userId =
      userData?.data?.id;

    if (!userId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "X account ID not found.",
          items: [],
        },
        {
          status: 500,
        }
      );
    }

    const postsResponse =
      await fetch(
        `https://api.x.com/2/users/${userId}/tweets?max_results=10&exclude=retweets,replies&tweet.fields=created_at,lang`,
        {
          headers: {
            Authorization:
              `Bearer ${bearerToken}`,
          },
          cache: "no-store",
        }
      );

    const postsData =
      await postsResponse.json();

    if (!postsResponse.ok) {
      console.error(
        "X posts request failed",
        postsResponse.status,
        postsData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Unable to load X posts.",
          status:
            postsResponse.status,
          items: [],
        },
        {
          status:
            postsResponse.status,
        }
      );
    }

    const items = (
      postsData?.data || []
    ).map(
      (post: {
        id: string;
        text: string;
        created_at?: string;
        lang?: string;
      }) => ({
        id: `x-${post.id}`,
        platform: "X",
        account: "BashaReport",
        handle: "@BashaReport",
        text: post.text,
        url:
          `https://x.com/BashaReport/status/${post.id}`,
        date:
          post.created_at ||
          new Date().toISOString(),
        topic: "General",
        language:
          post.lang?.toUpperCase() ||
          "EN",
        status:
          "Published post",
        relevance: 8,
      })
    );

    return NextResponse.json({
      ok: true,
      count: items.length,
      items,
    });
  } catch (error) {
    console.error(
      "X API error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to load X feed.",
        items: [],
      },
      {
        status: 500,
      }
    );
  }
}
