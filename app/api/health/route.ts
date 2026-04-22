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

  const emailFrom = process.env.EMAIL_FROM ?? null;
  const hasResendKey = !!process.env.RESEND_API_KEY;
  const hasDbUrl = !!process.env.DATABASE_URL;

  let dbOk = false;
  let dbErr: string | null = null;
  try {
    const sql = getSql();
    await sql`select 1 as ok`;
    dbOk = true;
  } catch (e) {
    dbErr = e instanceof Error ? e.message : "db error";
  }

  return NextResponse.json({
    ok: true,
    env: {
      ADMIN_TOKEN: true,
      DATABASE_URL: hasDbUrl,
      RESEND_API_KEY: hasResendKey,
      EMAIL_FROM: emailFrom,
    },
    database: { connected: dbOk, error: dbErr },
    notes: [
      hasResendKey
        ? null
        : "RESEND_API_KEY is not set — /api/submit will save to DB but cannot send confirmation emails.",
      hasResendKey && !emailFrom
        ? "EMAIL_FROM is unset; falling back to 'onboarding@resend.dev'. That sandbox sender only delivers to the email registered on your Resend account."
        : null,
    ].filter(Boolean),
  });
}
