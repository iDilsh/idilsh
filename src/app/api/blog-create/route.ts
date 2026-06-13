import { NextRequest, NextResponse } from "next/server";
import { createBlogPost } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, excerpt, content, imageUrl, category, published } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const post = await createBlogPost({
      title,
      excerpt: excerpt || "",
      content: content || "",
      imageUrl: imageUrl || null,
      category: category || "Dharma",
      published: published || false,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("Error creating blog post:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
