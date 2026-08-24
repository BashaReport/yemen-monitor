import { NextResponse } from "next/server";

export async function GET() {
  try {
    const url =
      "https://api.reliefweb.int/v2/reports?appname=bashareport.com&limit=2";

    const response = await fetch(url, {
      cache: "no-store",
    });

    const text = await response.text();

    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      reliefwebResponse: text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      }
    );
  }
}
