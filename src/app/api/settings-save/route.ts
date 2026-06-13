import { NextRequest, NextResponse } from "next/server";
import { execute, generateId, formatSiteSetting } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    // Check if setting exists
    const existing = await execute("SELECT * FROM SiteSetting WHERE key = ?", [key]);

    if (existing.rows.length > 0) {
      await execute("UPDATE SiteSetting SET value = ? WHERE key = ?", [value || "", key]);
    } else {
      const id = generateId();
      await execute("INSERT INTO SiteSetting (id, key, value) VALUES (?, ?, ?)", [id, key, value || ""]);
    }

    // Fetch the saved setting
    const result = await execute("SELECT * FROM SiteSetting WHERE key = ?", [key]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Failed to save setting" }, { status: 500 });
    }

    const setting = formatSiteSetting(result.rows[0]);
    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error saving setting:", error);
    return NextResponse.json(
      { error: "Failed to save setting" },
      { status: 500 }
    );
  }
}
