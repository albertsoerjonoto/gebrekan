"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/lib/nav";
import {
  ACTIVITY_LABELS,
  DAY_OPTIONS,
  INVITEE_LABELS,
  LOCATION_LABELS,
  BERANI_OPTIONS,
  getAccent,
  isFlowComplete,
} from "@/lib/options";
import { useFormState } from "@/lib/state";

type SendState = "idle" | "sending" | "sent" | "error";
type GuestState = "idle" | "sending" | "sent" | "error";
type EmailStatus = "sent" | "skipped" | "failed" | "not-attempted";

type SubmitResponse = {
  ok: boolean;
  email?: {
    owner: EmailStatus;
    guest: EmailStatus;
    ownerError?: string;
    guestError?: string;
  };
};

export default function PesanPage() {
  const { state, sessionId, setMessage, hydrated } = useFormState();
  const router = useRouter();
  const accent = getAccent(state.berani);
  const [status, setStatus] = useState<SendState>("idle");
  const [err, setErr] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<EmailStatus | null>(null);
  const [ownerEmailErr, setOwnerEmailErr] = useState<string | null>(null);
  const [guestStatus, setGuestStatus] = useState<GuestState>("idle");
  const [guestErr, setGuestErr] = useState<string | null>(null);
  const didAutoSubmit = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isFlowComplete({ ...state })) router.replace("/ngapain");
  }, [hydrated, state, router]);

  const submit = useCallback(
    async (opts?: { notifyGuest?: boolean }) => {
      if (!sessionId || !isFlowComplete({ ...state })) return false;
      if (inFlightRef.current) return false;
      inFlightRef.current = true;
      const notifyGuest = !!opts?.notifyGuest;
      if (notifyGuest) {
        setGuestStatus("sending");
        setGuestErr(null);
      } else {
        setStatus("sending");
        setErr(null);
      }
      try {
        const res = await fetch("/api/submit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, state, notifyGuest }),
        });
        if (!res.ok) throw new Error(`submit failed (${res.status})`);
        const data = (await res.json().catch(() => ({}))) as SubmitResponse;
        if (data.email) {
          setOwnerEmail(data.email.owner);
          setOwnerEmailErr(data.email.ownerError ?? null);
          if (notifyGuest) {
            if (data.email.guest === "sent") setGuestStatus("sent");
            else {
              setGuestStatus("error");
              setGuestErr(data.email.guestError ?? "email provider error");
            }
          }
        }
        if (!notifyGuest) setStatus("sent");
        else if (data.email?.guest === "sent") setGuestStatus("sent");
        return true;
      } catch (e) {
        const message = e instanceof Error ? e.message : "submit failed";
        if (notifyGuest) {
          setGuestStatus("error");
          setGuestErr(message);
        } else {
          setStatus("error");
          setErr(message);
        }
        return false;
      } finally {
        inFlightRef.current = false;
      }
    },
    [sessionId, state],
  );

  useEffect(() => {
    if (!hydrated || !sessionId) return;
    if (didAutoSubmit.current) return;
    if (!isFlowComplete({ ...state })) return;
    didAutoSubmit.current = true;
    void submit();
  }, [hydrated, sessionId, state, submit]);

  const onMessageChange = (v: string) => {
    setMessage(v);
    if (!didAutoSubmit.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setStatus("sending");
    debounceRef.current = setTimeout(() => {
      void submit();
    }, 1200);
  };

  const beraniLabel = BERANI_OPTIONS.find((b) => b.key === state.berani)?.label;
  const dayOpt = DAY_OPTIONS.find((d) => d.key === state.day);
  const locLabel = state.location ? LOCATION_LABELS[state.location] : null;
  const actLabel = state.activity ? ACTIVITY_LABELS[state.activity] : null;

  return (
    <>
      <Confetti />
    <PageShell
      page="pesan"
      title="yeayy"
      subtitle="see u soon"
      back={{ href: "/ngapain", label: "ubah" }}
    >
      <div className="flex flex-col gap-4">
        <div
          className="flex flex-col gap-1 rounded-2xl border p-4 text-sm"
          style={{ borderColor: accent }}
        >
          <Row label="mood" value={beraniLabel} />
          <Row label="kapan" value={dayOpt ? `${dayOpt.emoji} ${dayOpt.label} (${dayOpt.time})` : null} />
          {locLabel ? <Row label="lokasi" value={`${locLabel.emoji} ${locLabel.label}`} /> : null}
          {state.invitees.length > 0 ? (
            <Row
              label="sama siapa"
              value={state.invitees.map((i) => `${INVITEE_LABELS[i].emoji} ${INVITEE_LABELS[i].label}`).join(", ")}
            />
          ) : null}
          {actLabel ? <Row label="ngapain" value={`${actLabel.emoji} ${actLabel.label}`} /> : null}
        </div>

        <label className="flex flex-col gap-2">
          <textarea
            value={state.message}
            onChange={(e) => onMessageChange(e.target.value)}
            rows={4}
            placeholder=""
            className="rounded-2xl border bg-transparent p-3 outline-none focus:ring-2"
            style={{
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          />
        </label>

        {status === "error" ? (
          <button
            type="button"
            onClick={() => void submit()}
            className="nav-btn"
            style={{ background: accent, color: "#fff" }}
          >
            coba lagi
          </button>
        ) : null}

        {status === "sent" && ownerEmail && ownerEmail !== "sent" ? (
          <div
            className="rounded-2xl px-4 py-3 text-xs"
            style={{ background: "#fff5e6", color: "#8a5a00", border: "1px solid #f0c060" }}
          >
            ⚠ email notif gagal dikirim ke owner (
            {ownerEmail === "skipped" ? "RESEND_API_KEY belum di-set di Vercel" : "resend error"}
            ).{" "}
            {ownerEmailErr ? <span className="opacity-70">detail: {ownerEmailErr}</span> : null}
          </div>
        ) : null}

        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void submit({ notifyGuest: true })}
            disabled={guestStatus === "sending" || guestStatus === "sent"}
            className="nav-btn"
            data-variant="primary"
            style={{
              background: accent,
              color: "#fff",
              opacity: guestStatus === "sending" || guestStatus === "sent" ? 0.6 : 1,
            }}
          >
            {guestStatus === "sending"
              ? "ngirim ke albert..."
              : guestStatus === "sent"
                ? "✓ udh terkirim ke albert"
                : "kirim juga ke albert ✉️"}
          </button>
          {guestStatus === "error" ? (
            <p className="text-sm text-red-500">
              gagal kirim ke albert: {guestErr ?? "coba lagi"}
            </p>
          ) : null}
        </div>
      </div>
    </PageShell>
    </>
  );
}

const CONFETTI = [
  { left:"5%",  w:7,  h:11, color:"#CE3D66", delay:0,    dur:2.8 },
  { left:"12%", w:9,  h:7,  color:"#0072BB", delay:0.4,  dur:3.2 },
  { left:"20%", w:6,  h:10, color:"#FFD700", delay:0.9,  dur:2.5 },
  { left:"28%", w:8,  h:8,  color:"#FF69B4", delay:0.2,  dur:3.6 },
  { left:"35%", w:10, h:6,  color:"#CE3D66", delay:1.1,  dur:2.9 },
  { left:"43%", w:7,  h:12, color:"#0072BB", delay:0.6,  dur:3.1 },
  { left:"50%", w:9,  h:7,  color:"#FFD700", delay:1.5,  dur:2.7 },
  { left:"58%", w:6,  h:9,  color:"#FF69B4", delay:0.3,  dur:3.4 },
  { left:"65%", w:8,  h:10, color:"#CE3D66", delay:0.8,  dur:2.6 },
  { left:"72%", w:10, h:7,  color:"#0072BB", delay:1.3,  dur:3.0 },
  { left:"80%", w:7,  h:8,  color:"#FFD700", delay:0.1,  dur:3.3 },
  { left:"88%", w:9,  h:11, color:"#FF69B4", delay:0.7,  dur:2.4 },
  { left:"95%", w:6,  h:7,  color:"#CE3D66", delay:1.0,  dur:3.5 },
  { left:"8%",  w:8,  h:9,  color:"#FFD700", delay:1.8,  dur:2.8 },
  { left:"16%", w:7,  h:6,  color:"#FF69B4", delay:2.1,  dur:3.1 },
  { left:"33%", w:10, h:11, color:"#0072BB", delay:1.6,  dur:2.5 },
  { left:"55%", w:6,  h:8,  color:"#CE3D66", delay:2.4,  dur:3.2 },
  { left:"76%", w:9,  h:7,  color:"#FFD700", delay:1.9,  dur:2.9 },
  { left:"92%", w:7,  h:10, color:"#FF69B4", delay:2.6,  dur:3.4 },
  { left:"48%", w:8,  h:6,  color:"#0072BB", delay:2.0,  dur:2.6 },
];

function Confetti() {
  return (
    <>
      {CONFETTI.map((c, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: c.left,
            width: c.w,
            height: c.h,
            background: c.color,
            animationDuration: `${c.dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span className="text-xs uppercase tracking-widest opacity-60">{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
