import { NextResponse } from "next/server";
import { execute } from "@/lib/db";

export async function GET() {
  try {
    const result = await execute("SELECT * FROM SiteSetting");

    const settingsMap: Record<string, string> = {};
    result.rows.forEach((row) => {
      settingsMap[row.key as string] = row.value as string;
    });

    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
