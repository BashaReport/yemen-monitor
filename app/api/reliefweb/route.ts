import { NextResponse } from "next/server";

const RELIEFWEB_URL =
  "https://api.reliefweb.int/v2/reports?appname=BashaReport-YemenMonitor-7Fr389x3K";

export async function GET() {
  try {
    const response = await fetch(RELIEFWEB_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        preset: "latest",
        limit: 10,
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
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          status: response.status,
          ok: false,
          reliefwebResponse: text,
        },
        {
          status: response.status,
        }
      );
    }

    const data = JSON.parse(text);

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
          item.fields?.url ||
          item.href ||
          "",
        category: "Humanitarian",
      })) || [];

    return NextResponse.json({
      status: response.status,
      ok: true,
      count: articles.length,
      articles,
    });
  } catch (error) {
    console.error(
      "ReliefWeb test error",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          "Unable to connect to ReliefWeb",
      },
      {
        status: 500,
      }
    );
  }
}
