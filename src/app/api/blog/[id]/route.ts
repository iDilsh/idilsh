import { NextRequest, NextResponse } from "next/server";
import { execute, formatBlogPost } from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, excerpt, content, imageUrl, category, published } = body;

    const updates: string[] = [];
    const values: unknown[] = [];

    if (title !== undefined) { updates.push("title = ?"); values.push(title); }
    if (excerpt !== undefined) { updates.push("excerpt = ?"); values.push(excerpt); }
    if (content !== undefined) { updates.push("content = ?"); values.push(content); }
    if (imageUrl !== undefined) { updates.push("imageUrl = ?"); values.push(imageUrl); }
    if (category !== undefined) { updates.push("category = ?"); values.push(category); }
    if (published !== undefined) { updates.push("published = ?"); values.push(published ? 1 : 0); }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    updates.push("updatedAt = ?");
    values.push(new Date().toISOString());
    values.push(id);

    await execute(`UPDATE BlogPost SET ${updates.join(", ")} WHERE id = ?`, values);

    const result = await execute("SELECT * FROM BlogPost WHERE id = ?", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }

    const post = formatBlogPost(result.rows[0]);
    return NextResponse.json(post);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json(
      { error: "Failed to update blog post" },
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
    await execute("DELETE FROM BlogPost WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json(
      { error: "Failed to delete blog post" },
      { status: 500 }
    );
  }
}
