import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function GET() {
  try {
    const settingsMap = await getSettings();
    return NextResponse.json(settingsMap);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}
