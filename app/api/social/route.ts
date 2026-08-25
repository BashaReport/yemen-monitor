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
  relevance: number;
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
  "Sanaa Yemen",
  "Aden Yemen",
  "\"Red Sea\" Yemen",
  "\"Bab al-Mandab\"",
  "اليمن",
  "الحوثي",
  "الحوثيين",
  "صنعاء",
  "عدن اليمن",
  "البحر الأحمر",
  "باب المندب",
];

const strongTerms = [
  "yemen",
  "yemeni",
  "houthis",
  "houthi",
  "ansar allah",
  "ansarallah",
  "sanaa",
  "sana'a",
  "aden",
  "hudaydah",
  "hodeidah",
  "marib",
  "taiz",
  "hadramout",
  "shabwa",
  "saada",
  "red sea",
  "gulf of aden",
  "bab al-mandab",
  "bab el-mandeb",
  "اليمن",
  "يمني",
  "يمنية",
  "الحوثي",
  "الحوثيين",
  "أنصار الله",
  "صنعاء",
  "عدن",
  "الحديدة",
  "مأرب",
  "تعز",
  "حضرموت",
  "شبوة",
  "صعدة",
  "البحر الأحمر",
  "خليج عدن",
  "باب المندب",
];

const highSignalTerms = [
  "missile",
  "drone",
  "attack",
  "strike",
  "airstrike",
  "shelling",
  "clash",
  "military",
  "ceasefire",
  "detained",
  "detention",
  "humanitarian",
  "aid",
  "displacement",
  "famine",
  "shipping",
  "tanker",
  "vessel",
  "seafarer",
  "port",
  "blockade",
  "sanctions",
  "explosive",
  "mine",
  "government",
  "minister",
  "president",
  "negotiations",
  "مسيّرة",
  "مسيرة",
  "صاروخ",
  "هجوم",
  "غارة",
  "قصف",
  "اشتباكات",
  "عسكري",
  "هدنة",
  "احتجاز",
  "مساعدات",
  "نازحين",
  "نزوح",
  "سفينة",
  "ناقلة",
  "ميناء",
  "حصار",
  "عقوبات",
  "حكومة",
  "وزير",
  "رئيس",
];

const blockedTerms = [
  "football",
  "soccer",
  "basketball",
  "tennis",
  "cricket",
  "premier league",
  "champions league",
  "world cup",
  "match",
  "fixture",
  "score",
  "webtoon",
  "comicartist",
  "comic artist",
  "romance",
  "recipe",
  "restaurant",
  "vacation",
  "travel guide",
  "hotel",
  "gaming",
  "birthday party",
  "weather",
  "temperature",
  "climatecrisis",
  "الدوري",
  "مباراة",
  "كرة القدم",
  "تشيلسي",
  "فولهام",
  "الاتحاد",
  "الحزم",
];

function inferTopic(text: string) {
  const value = text.toLowerCase();

  if (
    value.includes("red sea") ||
    value.includes("gulf of aden") ||
    value.includes("bab al-mandab") ||
    value.includes("bab el-mandeb") ||
    value.includes("ship") ||
    value.includes("tanker") ||
    value.includes("vessel") ||
    value.includes("shipping") ||
    value.includes("seafarer") ||
    value.includes("البحر الأحمر") ||
    value.includes("خليج عدن") ||
    value.includes("باب المندب") ||
    value.includes("سفينة") ||
    value.includes("ناقلة")
  ) {
    return "Maritime";
  }

  if (
    value.includes("houthi") ||
    value.includes("houthis") ||
    value.includes("attack") ||
    value.includes("strike") ||
    value.includes("missile") ||
    value.includes("drone") ||
    value.includes("clash") ||
    value.includes("shelling") ||
    value.includes("military") ||
    value.includes("الحوثي") ||
    value.includes("الحوثيين") ||
    value.includes("هجوم") ||
    value.includes("قصف") ||
    value.includes("صاروخ") ||
    value.includes("مسيرة") ||
    value.includes("مسيّرة") ||
    value.includes("اشتباكات")
  ) {
    return "Security";
  }

  if (
    value.includes("humanitarian") ||
    value.includes("aid") ||
    value.includes("food") ||
    value.includes("famine") ||
    value.includes("health") ||
    value.includes("displacement") ||
    value.includes("refugee") ||
    value.includes("مساعدات") ||
    value.includes("نزوح") ||
    value.includes("نازحين") ||
    value.includes("غذاء") ||
    value.includes("صحة")
  ) {
    return "Humanitarian";
  }

  if (
    value.includes("government") ||
    value.includes("minister") ||
    value.includes("president") ||
    value.includes("political") ||
    value.includes("negotiation") ||
    value.includes("diplomat") ||
    value.includes("حكومة") ||
    value.includes("وزير") ||
    value.includes("رئيس") ||
    value.includes("سياسي") ||
    value.includes("مفاوضات")
  ) {
    return "Politics";
  }

  return "General";
}

function containsBlockedTerm(text: string) {
  const value = text.toLowerCase();

  return blockedTerms.some((term) =>
    value.includes(term)
  );
}

function relevanceScore(text: string) {
  const value = text.toLowerCase();

  if (containsBlockedTerm(value)) {
    return -100;
  }

  let score = 0;

  strongTerms.forEach((term) => {
    if (value.includes(term)) {
      score += 3;
    }
  });

  highSignalTerms.forEach((term) => {
    if (value.includes(term)) {
      score += 1;
    }
  });

  return score;
}

function hasStrongYemenContext(text: string) {
  const value = text.toLowerCase();

  return strongTerms.some((term) =>
    value.includes(term)
  );
}

function isLikelyFalseAdenMatch(text: string) {
  const value = text.toLowerCase();

  if (!value.includes("aden")) {
    return false;
  }

  const hasOtherYemenSignal =
    strongTerms.some(
      (term) =>
        term !== "aden" &&
        value.includes(term)
    );

  if (hasOtherYemenSignal) {
    return false;
  }

  const falseSignals = [
    "aden gillett",
    "good boy, aden",
    "dear aden",
    "my friend aden",
    "aden is",
  ];

  return falseSignals.some((term) =>
    value.includes(term)
  );
}

function buildPostUrl(
  handle: string,
  uri: string
) {
  const parts = uri.split("/");
  const rkey =
    parts[parts.length - 1];

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
    "&limit=30&sort=latest";

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

    const responseText =
      await response.text();

    if (!response.ok) {
      console.error(
        "Bluesky search failed",
        query,
        response.status,
        responseText
      );

      return [];
    }

    const data =
      JSON.parse(responseText);

    const posts =
      data?.posts || [];

    return posts.map(
      (post: any) => {
        const postText =
          post?.record?.text || "";

        const handle =
          post?.author?.handle || "";

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
            post?.record?.createdAt ||
            post?.indexedAt ||
            new Date()
              .toISOString(),

          topic:
            inferTopic(postText),

          language:
            Array.isArray(langs) &&
            langs.length > 0
              ? langs.join(", ")
              : "Unknown",

          status:
            "UNVERIFIED",

          relevance:
            relevanceScore(
              postText
            ),
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
        .filter((item) => {
          if (
            !item.text ||
            !item.url
          ) {
            return false;
          }

          if (
            seen.has(item.id)
          ) {
            return false;
          }

          if (
            containsBlockedTerm(
              item.text
            )
          ) {
            return false;
          }

          if (
            isLikelyFalseAdenMatch(
              item.text
            )
          ) {
            return false;
          }

          if (
            !hasStrongYemenContext(
              item.text
            )
          ) {
            return false;
          }

          if (
            item.relevance < 3
          ) {
            return false;
          }

          seen.add(item.id);

          return true;
        })
        .sort((a, b) => {
          const timeDifference =
            new Date(
              b.date
            ).getTime() -
            new Date(
              a.date
            ).getTime();

          if (
            Math.abs(
              timeDifference
            ) <
            10 * 60 * 1000
          ) {
            return (
              b.relevance -
              a.relevance
            );
          }

          return timeDifference;
        })
        .slice(0, 50);

    const topicCounts =
      items.reduce(
        (
          counts,
          item
        ) => {
          counts[
            item.topic
          ] =
            (
              counts[
                item.topic
              ] || 0
            ) + 1;

          return counts;
        },
        {} as Record<
          string,
          number
        >
      );

    const languageCounts =
      items.reduce(
        (
          counts,
          item
        ) => {
          counts[
            item.language
          ] =
            (
              counts[
                item.language
              ] || 0
            ) + 1;

          return counts;
        },
        {} as Record<
          string,
          number
        >
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

      topicCounts,

      languageCounts,

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
