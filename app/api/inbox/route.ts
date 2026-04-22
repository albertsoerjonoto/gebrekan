import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "ADMIN_TOKEN not set" }, { status: 500 });
  }
  const provided = req.nextUrl.searchParams.get("token") ?? req.headers.get("x-admin-token");
  if (provided !== token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const sql = getSql();

  const sessions = (await sql`
    select id, created_at, last_seen_at, last_page, submitted_at, final, message, snapshot, user_agent, referer
    from sessions
    order by coalesce(submitted_at, last_seen_at) desc
    limit 200
  `) as Array<Record<string, unknown>>;

  const ids = sessions.map((s) => s.id as string);
  let events: Array<Record<string, unknown>> = [];
  if (ids.length) {
    events = (await sql`
      select session_id, ts, type, page, field, value
      from events
      where session_id = any(${ids}::uuid[])
      order by ts asc
    `) as Array<Record<string, unknown>>;
  }

  const byId = new Map<string, Array<Record<string, unknown>>>();
  for (const e of events) {
    const key = e.session_id as string;
    const arr = byId.get(key) ?? [];
    arr.push(e);
    byId.set(key, arr);
  }

  return NextResponse.json({
    ok: true,
    sessions: sessions.map((s) => ({ ...s, events: byId.get(s.id as string) ?? [] })),
  });
}
