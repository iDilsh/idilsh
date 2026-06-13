import { NextRequest, NextResponse } from "next/server";
import { execute, generateId, formatBlogPost } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, excerpt, content, imageUrl, category, published } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const id = generateId();
    const now = new Date().toISOString();
    const publishedInt = published ? 1 : 0;

    await execute(
      `INSERT INTO BlogPost (id, title, excerpt, content, imageUrl, category, published, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, excerpt || "", content || "", imageUrl || null, category || "Dharma", publishedInt, now, now]
    );

    // Fetch the created post
    const result = await execute("SELECT * FROM BlogPost WHERE id = ?", [id]);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Failed to create blog post" },
        { status: 500 }
      );
    }

    const post = formatBlogPost(result.rows[0]);
    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
