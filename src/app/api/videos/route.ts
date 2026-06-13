import { NextRequest, NextResponse } from "next/server";
import { execute, formatVideo } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const includeUnpublished = req.nextUrl.searchParams.get("all") === "true";

    const result = includeUnpublished
      ? await execute("SELECT * FROM Video ORDER BY createdAt DESC")
      : await execute("SELECT * FROM Video WHERE published = 1 ORDER BY createdAt DESC");

    const videos = result.rows.map((row) => formatVideo(row));
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
