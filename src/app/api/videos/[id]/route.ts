import { NextRequest, NextResponse } from "next/server";
import { execute, formatVideo } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, youtubeId, thumbnail, category, published } = body;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (title !== undefined) { updates.push("title = ?"); values.push(title); }
    if (description !== undefined) { updates.push("description = ?"); values.push(description); }
    if (youtubeId !== undefined) { updates.push("youtubeId = ?"); values.push(youtubeId); }
    if (thumbnail !== undefined) { updates.push("thumbnail = ?"); values.push(thumbnail); }
    if (category !== undefined) { updates.push("category = ?"); values.push(category); }
    if (published !== undefined) { updates.push("published = ?"); values.push(published ? 1 : 0); }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await execute(`UPDATE Video SET ${updates.join(", ")} WHERE id = ?`, values);

    const result = await execute("SELECT * FROM Video WHERE id = ?", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const video = formatVideo(result.rows[0]);
    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    return NextResponse.json(
      { error: "Failed to update video" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await execute("DELETE FROM Video WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
