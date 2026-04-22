"use client";

import { useEffect, useState } from "react";
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

export default function PesanPage() {
  const { state, sessionId, setMessage, hydrated } = useFormState();
  const router = useRouter();
  const accent = getAccent(state.berani);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (!isFlowComplete({ ...state })) router.replace("/ngapain");
  }, [hydrated, state, router]);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId, state }),
      });
      if (!res.ok) throw new Error(`submit failed (${res.status})`);
      router.push("/done");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "submit failed");
      setBusy(false);
    }
  };

  const beraniLabel = BERANI_OPTIONS.find((b) => b.key === state.berani)?.label;
  const dayOpt = DAY_OPTIONS.find((d) => d.key === state.day);
  const locLabel = state.location ? LOCATION_LABELS[state.location] : null;
  const actLabel = state.activity ? ACTIVITY_LABELS[state.activity] : null;

  return (
    <PageShell
      page="pesan"
      title="sip. konfirmasi yuk"
      back={{ href: "/ngapain" }}
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
          <span className="text-sm opacity-70">mau nulis pesan?</span>
          <textarea
            value={state.message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="opsional ya"
            className="rounded-2xl border bg-transparent p-3 outline-none focus:ring-2"
            style={{
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          />
        </label>

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="nav-btn"
          data-variant="primary"
          style={{ background: accent, color: "#fff" }}
        >
          {busy ? "ngirim..." : "kirim"}
        </button>
        {err ? <p className="text-sm text-red-500">{err}</p> : null}
      </div>
    </PageShell>
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
