import { NextRequest, NextResponse } from "next/server";
import { SOPHIA_EMAIL, formatSummary, sendEmail, getFromEmail } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  state: {
    berani: string | null;
    day: string | null;
    location: string | null;
    invitees: string[];
    activity: string | null;
    message: string;
  };
};

function konfirmasiFrom(): string {
  const email = getFromEmail();
  return `konfirmasi <${email}>`;
}

export async function POST(req: NextRequest) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const { state } = body ?? {};
  if (!state?.day || !state?.activity) {
    return NextResponse.json({ ok: false, error: "bad payload" }, { status: 400 });
  }

  const summary = formatSummary({ ...state, message: state.message ?? "" }, "konfirmasi");

  sendEmail({
    to: SOPHIA_EMAIL,
    subject: summary.subject,
    text: summary.text,
    html: summary.html,
    from: konfirmasiFrom(),
  }).catch((e) => console.warn("[konfirmasi] email failed silently:", e));

  return NextResponse.json({ ok: true });
}
