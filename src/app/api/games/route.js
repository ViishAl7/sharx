import { NextResponse } from "next/server";
import { getGamesPage } from "../../../lib/games-data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function positiveInt(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const page = positiveInt(searchParams.get("page"), 1, 10000);
  const limit = positiveInt(searchParams.get("limit"), 50, 100);

  try {
    const result = await getGamesPage(page, limit);

    return NextResponse.json(result, {
      status: 200,
      headers: {
        // Browser, Vercel and CDN ko har page ka stale response dene se rokta hai.
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("GET /api/games failed:", error);

    return NextResponse.json(
      { error: "Games could not be loaded." },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, s-maxage=0",
        },
      }
    );
  }
}