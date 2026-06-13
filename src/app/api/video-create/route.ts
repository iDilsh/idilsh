import { NextRequest, NextResponse } from "next/server";
import { execute, generateId, formatVideo } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, youtubeId, thumbnail, category, published } = body;

    if (!title || !youtubeId) {
      return NextResponse.json(
        { error: "Title and YouTube ID are required" },
        { status: 400 }
      );
    }

    const id = generateId();
    const now = new Date().toISOString();
    const publishedInt = published !== false ? 1 : 0;

    await execute(
      `INSERT INTO Video (id, title, description, youtubeId, thumbnail, category, published, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description || null, youtubeId, thumbnail || null, category || "Sermon", publishedInt, now, now]
    );

    const result = await execute("SELECT * FROM Video WHERE id = ?", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
    }

    const video = formatVideo(result.rows[0]);
    return NextResponse.json(video, { status: 201 });
  } catch (error) {
    console.error("Error creating video:", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
