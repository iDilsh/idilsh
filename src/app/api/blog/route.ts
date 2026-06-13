import { NextRequest, NextResponse } from "next/server";
import { execute, formatBlogPost } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const includeUnpublished = req.nextUrl.searchParams.get("all") === "true";

    const result = includeUnpublished
      ? await execute("SELECT * FROM BlogPost ORDER BY createdAt DESC")
      : await execute("SELECT * FROM BlogPost WHERE published = 1 ORDER BY createdAt DESC");

    const posts = result.rows.map((row) => formatBlogPost(row));
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
