"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/lib/nav";
import { DAY_OPTIONS, getAccent, needsLocationPage, needsInviteesPage } from "@/lib/options";
import type { DayKey } from "@/lib/options";
import { useFormState } from "@/lib/state";

export default function KapanPage() {
  const { state, setDay, hydrated } = useFormState();
  const router = useRouter();
  const accent = getAccent(state.berani);

  useEffect(() => {
    if (hydrated && !state.berani) router.replace("/");
  }, [hydrated, state.berani, router]);

  useEffect(() => {
    router.prefetch("/lokasi");
    router.prefetch("/siapa");
    router.prefetch("/ngapain");
  }, [router]);

  const title = state.berani === "udh_haha" ? "wow. kapan u free" : "gpp. kapan u free";

  const nextHrefFor = (day: DayKey) => {
    if (needsLocationPage(day)) return "/lokasi";
    if (needsInviteesPage(state.berani)) return "/siapa";
    return "/ngapain";
  };

  return (
    <PageShell
      page="kapan"
      title={title}
      back={{ href: "/" }}
    >
      <div className="flex flex-col gap-3">
        {DAY_OPTIONS.map((opt) => {
          const selected = state.day === opt.key;
          const bg =
            opt.tone === "midnight" ? "#03060f" : opt.tone === "night" ? "#0f1930" : "#ffd89b";
          const baseText = opt.tone === "day" ? "#111111" : "#ffffff";
          const timeColor =
            opt.tone === "midnight" ? "#7a93d6" : opt.tone === "night" ? "#ffe58a" : "#111111";
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setDay(opt.key);
                router.push(nextHrefFor(opt.key));
              }}
              className="option-card"
              data-selected={selected}
              style={{
                background: bg,
                color: baseText,
                borderColor: selected ? accent : "transparent",
                outline: selected ? `2px solid ${accent}` : "none",
                outlineOffset: 2,
              }}
            >
              <span className="flex items-center gap-3 text-base">
                <span className="text-xl">{opt.emoji}</span>
                <span>{opt.label}</span>
              </span>
              <span className="text-sm font-bold" style={{ color: timeColor }}>
                {opt.time}
              </span>
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}
