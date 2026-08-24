import { NextResponse } from "next/server";

const RELIEFWEB_URL =
  "https://api.reliefweb.int/v1/reports?appname=basha-report&profile=list&preset=latest&slim=1&limit=20&filter[field]=country.iso3&filter[value]=yem";

export async function GET() {
  try {
    const response = await fetch(RELIEFWEB_URL, {
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      throw new Error("ReliefWeb request failed");
    }

    const data = await response.json();

    const articles =
      data?.data?.map((item: any) => ({
        id: item.id,
        title: item.fields?.title || "Untitled report",
        date: item.fields?.date?.created || "",
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
      articles,
    });
  } catch (error) {
    console.error(error);

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
