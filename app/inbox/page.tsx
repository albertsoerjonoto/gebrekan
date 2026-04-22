"use client";

import { useEffect, useState } from "react";
import {
  ACTIVITY_LABELS,
  BERANI_OPTIONS,
  DAY_OPTIONS,
  INVITEE_LABELS,
  LOCATION_LABELS,
} from "@/lib/options";

type EventRow = { ts: string; type: string; page: string | null; field: string | null; value: unknown };
type SessionRow = {
  id: string;
  created_at: string;
  last_seen_at: string;
  last_page: string | null;
  submitted_at: string | null;
  final: null | Record<string, unknown>;
  message: string | null;
  snapshot: null | Record<string, unknown>;
  user_agent: string | null;
  referer: string | null;
  events: EventRow[];
};

function humanizeValue(field: string | null, value: unknown) {
  if (field === "berani") {
    const o = BERANI_OPTIONS.find((b) => b.key === value);
    return o ? o.label : String(value);
  }
  if (field === "day") {
    const o = DAY_OPTIONS.find((d) => d.key === value);
    return o ? `${o.emoji} ${o.label} (${o.time})` : String(value);
  }
  if (field === "location" && typeof value === "string") {
    const o = LOCATION_LABELS[value as keyof typeof LOCATION_LABELS];
    return o ? `${o.emoji} ${o.label}` : value;
  }
  if (field === "invitees" && typeof value === "string") {
    const o = INVITEE_LABELS[value as keyof typeof INVITEE_LABELS];
    return o ? `toggle ${o.emoji} ${o.label}` : `toggle ${value}`;
  }
  if (field === "activity" && typeof value === "string") {
    const o = ACTIVITY_LABELS[value as keyof typeof ACTIVITY_LABELS];
    return o ? `${o.emoji} ${o.label}` : value;
  }
  return JSON.stringify(value);
}

export default function InboxPage() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<SessionRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem("gebrekan:admin");
    if (saved) setToken(saved);
  }, []);

  const load = async (t: string) => {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch(`/api/inbox?token=${encodeURIComponent(t)}`);
      const j = await res.json();
      if (!res.ok || !j.ok) throw new Error(j.error ?? `status ${res.status}`);
      setData(j.sessions as SessionRow[]);
      sessionStorage.setItem("gebrekan:admin", t);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "error");
      setData(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h1 className="text-2xl font-semibold">inbox</h1>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          load(token);
        }}
      >
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="admin token"
          className="flex-1 rounded-full border bg-transparent px-4 py-2 outline-none"
          style={{ borderColor: "var(--border)", color: "var(--fg)" }}
        />
        <button type="submit" className="nav-btn" data-variant="primary" style={{ background: "#CE3D66", color: "#fff" }}>
          {busy ? "..." : "load"}
        </button>
      </form>
      {err ? <p className="text-sm text-red-500">{err}</p> : null}
      {data && data.length === 0 ? <p className="opacity-60">belom ada respons.</p> : null}
      {data?.map((s) => (
        <article key={s.id} className="flex flex-col gap-2 rounded-2xl border p-4" style={{ borderColor: "var(--border)" }}>
          <header className="flex flex-wrap items-center justify-between gap-2 text-xs opacity-70">
            <span className="font-mono">{s.id.slice(0, 8)}</span>
            <span>
              {s.submitted_at
                ? `✅ submitted ${new Date(s.submitted_at).toLocaleString()}`
                : `👀 last seen ${new Date(s.last_seen_at).toLocaleString()}`}
            </span>
          </header>
          {s.final ? (
            <pre className="overflow-x-auto rounded-lg bg-black/5 p-3 text-xs dark:bg-white/5">
              {JSON.stringify(s.final, null, 2)}
            </pre>
          ) : s.snapshot ? (
            <pre className="overflow-x-auto rounded-lg bg-black/5 p-3 text-xs dark:bg-white/5">
              {JSON.stringify(s.snapshot, null, 2)}
            </pre>
          ) : null}
          {s.message ? (
            <p className="rounded-lg border p-3 text-sm italic" style={{ borderColor: "var(--border)" }}>
              “{s.message}”
            </p>
          ) : null}
          <details className="text-xs">
            <summary className="cursor-pointer opacity-70">{s.events.length} events</summary>
            <ol className="mt-2 flex flex-col gap-1">
              {s.events.map((e, i) => (
                <li key={i} className="font-mono">
                  {new Date(e.ts).toLocaleTimeString()} · {e.type}
                  {e.page ? ` · ${e.page}` : ""}
                  {e.field ? ` · ${e.field}=${humanizeValue(e.field, e.value)}` : ""}
                </li>
              ))}
            </ol>
          </details>
        </article>
      ))}
    </div>
  );
}
