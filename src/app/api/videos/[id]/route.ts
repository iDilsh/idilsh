import { NextRequest, NextResponse } from "next/server";
import { getVideo, updateVideo, deleteVideo } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, youtubeId, thumbnail, category, published } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (youtubeId !== undefined) updateData.youtubeId = youtubeId;
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
    if (category !== undefined) updateData.category = category;
    if (published !== undefined) updateData.published = published;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const video = await updateVideo(id, updateData as Parameters<typeof updateVideo>[1]);
    return NextResponse.json(video);
  } catch (error) {
    console.error("Error updating video:", error);
    const message = error instanceof Error ? error.message : "Failed to update video";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteVideo(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json(
      { error: "Failed to delete video" },
      { status: 500 }
    );
  }
}
