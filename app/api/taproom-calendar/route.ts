import { NextResponse } from "next/server";
import { GOOGLE_CALENDAR_ID } from "@/lib/calendar-embed";
import { parseTaproomCalendar } from "@/lib/taproom-calendar-feed";

export async function GET(request: Request) {
  const month = new URL(request.url).searchParams.get("month") ?? "";
  if (!/^20\d{2}-(0[1-9]|1[0-2])$/.test(month)) {
    return NextResponse.json({ error: "Use a month in YYYY-MM format." }, { status: 400 });
  }
  const [year, index] = month.split("-").map(Number);
  // Include adjacent days so a week spanning two months still has every event.
  const from = new Date(Date.UTC(year, index - 1, -6, 7));
  const to = new Date(Date.UTC(year, index, 8, 7));
  try {
    const response = await fetch(`https://calendar.google.com/calendar/ical/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/public/basic.ics`, {
      next: { revalidate: 300 }, signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error("Public calendar unavailable");
    const events = parseTaproomCalendar(await response.text(), from, to);
    return NextResponse.json({ events }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return NextResponse.json({ error: "The calendar could not be loaded. Please try again or open Google Calendar." }, { status: 502 });
  }
}
