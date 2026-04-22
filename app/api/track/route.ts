import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingEvent =
  | { type: "page_view"; page: string }
  | { type: "change"; field: string; value: unknown }
  | { type: "submit" };

type Payload = {
  sessionId: string;
  events: IncomingEvent[];
  snapshot?: unknown;
};

function isUuid(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const { sessionId, events, snapshot } = body ?? {};
  if (!sessionId || !isUuid(sessionId) || !Array.isArray(events)) {
    return NextResponse.json({ ok: false, error: "bad payload" }, { status: 400 });
  }

  const sql = getSql();
  const ua = req.headers.get("user-agent") ?? null;
  const ref = req.headers.get("referer") ?? null;

  try {
    await sql`
      insert into sessions (id, user_agent, referer, snapshot)
      values (${sessionId}, ${ua}, ${ref}, ${snapshot ? JSON.stringify(snapshot) : null}::jsonb)
      on conflict (id) do update set
        last_seen_at = now(),
        snapshot = coalesce(excluded.snapshot, sessions.snapshot)
    `;

    const lastPageView = [...events].reverse().find((e) => e.type === "page_view");
    if (lastPageView && lastPageView.type === "page_view") {
      await sql`update sessions set last_page = ${lastPageView.page} where id = ${sessionId}`;
    }

    for (const ev of events) {
      if (ev.type === "page_view") {
        await sql`
          insert into events (session_id, type, page, field, value)
          values (${sessionId}, 'page_view', ${ev.page}, null, null)
        `;
      } else if (ev.type === "change") {
        await sql`
          insert into events (session_id, type, page, field, value)
          values (${sessionId}, 'change', null, ${ev.field}, ${JSON.stringify(ev.value)}::jsonb)
        `;
      } else if (ev.type === "submit") {
        await sql`
          insert into events (session_id, type, page, field, value)
          values (${sessionId}, 'submit', null, null, null)
        `;
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "db error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
