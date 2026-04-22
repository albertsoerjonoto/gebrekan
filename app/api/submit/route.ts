import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { GUEST_EMAIL, OWNER_EMAIL, formatSummary, sendEmail, getFromEmail } from "@/lib/email";
import { buildIcs } from "@/lib/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  sessionId: string;
  state: {
    berani: string | null;
    day: string | null;
    location: string | null;
    invitees: string[];
    activity: string | null;
    message: string;
  };
  notifyGuest?: boolean;
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
  const { sessionId, state, notifyGuest } = body ?? {};
  if (!sessionId || !isUuid(sessionId) || !state) {
    return NextResponse.json({ ok: false, error: "bad payload" }, { status: 400 });
  }
  if (!state.berani || !state.day || !state.activity) {
    return NextResponse.json({ ok: false, error: "incomplete" }, { status: 400 });
  }

  const sql = getSql();
  const ua = req.headers.get("user-agent") ?? null;
  const ref = req.headers.get("referer") ?? null;
  const msg = (state.message ?? "").slice(0, 2000);

  try {
    await sql`
      insert into sessions (id, user_agent, referer, snapshot, final, message, submitted_at)
      values (${sessionId}, ${ua}, ${ref}, ${JSON.stringify(state)}::jsonb, ${JSON.stringify(state)}::jsonb, ${msg}, now())
      on conflict (id) do update set
        snapshot = excluded.snapshot,
        final = excluded.final,
        message = excluded.message,
        submitted_at = now(),
        last_seen_at = now()
    `;
    await sql`
      insert into events (session_id, type, page, field, value)
      values (${sessionId}, 'submit', null, null, ${JSON.stringify(state)}::jsonb)
    `;
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : "db error";
    return NextResponse.json({ ok: false, error: errMsg }, { status: 500 });
  }

  const summary = formatSummary({ ...state, message: msg });

  const icsContent = buildIcs({
    sessionId,
    dayKey: state.day ?? "",
    activityKey: state.activity,
    locationKey: state.location,
    description: summary.text,
    organizerEmail: getFromEmail(),
    attendees: [OWNER_EMAIL, GUEST_EMAIL],
  });

  const calSubject = `📅 ${summary.subject}`;
  const calText = "gebrekan — calendar invite attached.";
  const calHtml = `<p style="font-family:system-ui,sans-serif;">gebrekan — calendar invite attached.</p>`;

  const send = (to: string, ics?: string | null) =>
    sendEmail({
      to,
      subject: ics ? calSubject : summary.subject,
      text: ics ? calText : summary.text,
      html: ics ? calHtml : summary.html,
      ...(ics ? { icsContent: ics } : {}),
    }).catch((e) => {
      console.warn(`[submit] email to ${to} failed silently:`, e);
      return { ok: false as const, error: "silent" };
    });

  const [ownerSummary, guestSummary, ownerCal, guestCal] = await Promise.all([
    send(OWNER_EMAIL),
    send(GUEST_EMAIL),
    icsContent ? send(OWNER_EMAIL, icsContent) : Promise.resolve(null),
    icsContent ? send(GUEST_EMAIL, icsContent) : Promise.resolve(null),
  ]);

  [ownerSummary, guestSummary, ownerCal, guestCal].forEach((r, i) => {
    if (r && !r.ok) console.warn(`[submit] email[${i}] failure`, r);
  });

  void notifyGuest;

  return NextResponse.json({ ok: true });
}
