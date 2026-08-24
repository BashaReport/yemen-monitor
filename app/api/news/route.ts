import { NextResponse } from "next/server";

const RELIEFWEB_URL =
  "https://api.reliefweb.int/v2/reports?appname=bashareport.com";

export async function GET() {
  try {
    const response = await fetch(RELIEFWEB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preset: "latest",
        limit: 20,
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
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "ReliefWeb error",
        response.status,
        errorText
      );

      throw new Error(
        `ReliefWeb request failed with ${response.status}`
      );
    }

    const data = await response.json();

    const articles =
      data?.data?.map((item: any) => ({
        id: item.id,
        title: item.fields?.title || "Untitled report",
        date: item.fields?.date?.created || "",
        source:
          item.fields?.source?.[0]?.name || "ReliefWeb",
        url:
          item.fields?.url_alias ||
          item.fields?.url ||
          item.href ||
          "",
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
