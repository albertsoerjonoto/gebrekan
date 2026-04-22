import { NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { GUEST_EMAIL, OWNER_EMAIL, formatSummary, sendEmail } from "@/lib/email";

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

  const [ownerResult, guestResult] = await Promise.all([
    sendEmail({ to: OWNER_EMAIL, subject: summary.subject, text: summary.text, html: summary.html }),
    sendEmail({ to: GUEST_EMAIL, subject: summary.subject, text: summary.text, html: summary.html })
      .catch((e) => {
        console.warn("[submit] guest email failed silently:", e);
        return { ok: false as const, error: "silent" };
      }),
  ]);

  if (!ownerResult.ok) console.warn("[submit] owner email failure", ownerResult);
  if (!guestResult.ok) console.warn("[submit] guest email failure (silent)", guestResult);

  void notifyGuest;

  const emailStatus = (r: typeof ownerResult) =>
    r ? (r.ok ? "sent" : "skipped" in r && r.skipped ? "skipped" : "failed") : "not-attempted";

  return NextResponse.json({
    ok: true,
    email: {
      owner: emailStatus(ownerResult),
      ownerError: ownerResult && !ownerResult.ok ? ownerResult.error : undefined,
    },
  });
}
