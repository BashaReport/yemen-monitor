import { NextResponse } from "next/server";

const RELIEFWEB_URL = "https://api.reliefweb.int/v1/reports";

export async function GET() {
  try {
    const response = await fetch(RELIEFWEB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appname: "basha-report",
        profile: "list",
        preset: "latest",
        limit: 20,
        filter: {
          field: "country.iso3",
          value: "YEM",
        },
        fields: {
          include: [
            "title",
            "date.created",
            "source.name",
            "url_alias",
          ],
        },
      }),
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      const text = await response.text();

      console.error(
        "ReliefWeb error",
        response.status,
        text
      );

      throw new Error(
        `ReliefWeb request failed with ${response.status}`
      );
    }

    const data = await response.json();

    const articles =
      data?.data?.map((item: any) => ({
        id: item.id,
        title:
          item.fields?.title ||
          "Untitled report",
        date:
          item.fields?.date?.created ||
          "",
        source:
          item.fields?.source?.[0]?.name ||
          "ReliefWeb",
        url:
          item.fields?.url_alias ||
          `https://reliefweb.int/node/${item.id}`,
        category: "Humanitarian",
      })) || [];

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error("Yemen news API error", error);

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
