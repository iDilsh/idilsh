import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const includeUnpublished = req.nextUrl.searchParams.get("all") === "true";
    const videos = await db.video.findMany({
      where: includeUnpublished ? {} : { published: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
