import { NextRequest, NextResponse } from "next/server";
import { getVideos } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const includeUnpublished = req.nextUrl.searchParams.get("all") === "true";
    const videos = await getVideos(includeUnpublished);
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
