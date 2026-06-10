import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, youtubeId, thumbnail, category, published } =
      body;

    if (!title || !youtubeId) {
      return NextResponse.json(
        { error: "Title and YouTube ID are required" },
        { status: 400 }
      );
    }

    const video = await db.video.create({
      data: {
        title,
        description: description || null,
        youtubeId,
        thumbnail: thumbnail || null,
        category: category || "Sermon",
        published: published ?? true,
      },
    });

    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
