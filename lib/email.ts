import {
  ACTIVITY_LABELS,
  BERANI_OPTIONS,
  DAY_OPTIONS,
  INVITEE_LABELS,
  LOCATION_LABELS,
} from "./options";
import type {
  ActivityKey,
  BeraniKey,
  DayKey,
  InviteeKey,
  LocationKey,
} from "./options";

type SubmissionState = {
  berani: BeraniKey | string | null;
  day: DayKey | string | null;
  location: LocationKey | string | null;
  invitees: (InviteeKey | string)[];
  activity: ActivityKey | string | null;
  message: string;
};

export function formatSummary(state: SubmissionState): {
  subject: string;
  text: string;
  html: string;
} {
  const beraniLabel =
    BERANI_OPTIONS.find((b) => b.key === state.berani)?.label ?? state.berani ?? "-";
  const dayOpt = DAY_OPTIONS.find((d) => d.key === state.day);
  const dayLabel = dayOpt ? `${dayOpt.emoji} ${dayOpt.label} (${dayOpt.time})` : state.day ?? "-";
  const locMeta = state.location
    ? LOCATION_LABELS[state.location as LocationKey]
    : null;
  const locLabel = locMeta ? `${locMeta.emoji} ${locMeta.label}` : null;
  const inviteeList = state.invitees
    .map((i) => {
      const m = INVITEE_LABELS[i as InviteeKey];
      return m ? `${m.emoji} ${m.label}` : String(i);
    })
    .join(", ");
  const actMeta = state.activity ? ACTIVITY_LABELS[state.activity as ActivityKey] : null;
  const actLabel = actMeta ? `${actMeta.emoji} ${actMeta.label}` : state.activity ?? "-";
  const message = (state.message ?? "").trim();

  const subject = `gebrekan: ${dayOpt?.label ?? "??"} — ${actMeta?.label ?? "??"}`;

  const lines = [
    `mood     : ${beraniLabel}`,
    `kapan    : ${dayLabel}`,
    locLabel ? `lokasi   : ${locLabel}` : null,
    inviteeList ? `sama     : ${inviteeList}` : null,
    `ngapain  : ${actLabel}`,
    message ? `\npesan:\n${message}` : null,
  ].filter(Boolean);
  const text = lines.join("\n");

  const rows = [
    ["mood", beraniLabel],
    ["kapan", dayLabel],
    locLabel ? ["lokasi", locLabel] : null,
    inviteeList ? ["sama siapa", inviteeList] : null,
    ["ngapain", actLabel],
  ].filter(Boolean) as [string, string][];

  const html = `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;background:#fafafa;padding:24px;">
<div style="max-width:480px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:16px;padding:20px;">
<h2 style="margin:0 0 12px 0;color:#CE3D66;">gebrekan — kecatet ✓</h2>
<table style="width:100%;border-collapse:collapse;font-size:14px;">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 0;color:#888;text-transform:uppercase;letter-spacing:.08em;font-size:11px;width:110px;">${escapeHtml(
        k,
      )}</td><td style="padding:6px 0;">${escapeHtml(v)}</td></tr>`,
  )
  .join("")}
</table>
${
  message
    ? `<div style="margin-top:16px;padding:12px;border-radius:12px;background:#f5f5f5;white-space:pre-wrap;font-size:14px;">${escapeHtml(
        message,
      )}</div>`
    : ""
}
</div></body></html>`;

  return { subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type SendResult =
  | { ok: true; id?: string }
  | { ok: false; error: string; skipped?: boolean; status?: number };

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "gebrekan <onboarding@resend.dev>";
  if (!key) {
    console.error(
      "[email] RESEND_API_KEY not set — confirmation email to",
      params.to,
      "was skipped",
    );
    return { ok: false, skipped: true, error: "RESEND_API_KEY not set" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      const snippet = body.slice(0, 300);
      console.error(
        `[email] resend ${res.status} sending to ${params.to} from "${from}": ${snippet}`,
      );
      return { ok: false, status: res.status, error: `${res.status}: ${snippet}` };
    }
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    console.log(`[email] sent to ${params.to} (id=${data.id ?? "?"})`);
    return { ok: true, id: data.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch failed";
    console.error(`[email] fetch failed for ${params.to}: ${msg}`);
    return { ok: false, error: msg };
  }
}

export const OWNER_EMAIL = "albertsoerjonoto98@gmail.com";
export const GUEST_EMAIL = "albertsoerjonoto98@gmail.com";
