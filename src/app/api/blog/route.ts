import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const includeUnpublished = req.nextUrl.searchParams.get("all") === "true";
    const posts = await getBlogPosts(includeUnpublished);
    return NextResponse.json(posts);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
