"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/lib/nav";
import {
  ACTIVITY_LABELS,
  allowedActivities,
  getAccent,
  needsInviteesPage,
  needsLocationPage,
} from "@/lib/options";
import { findActiveDayOption } from "@/lib/dayOptions";
import { useFormState } from "@/lib/state";

export default function NgapainPage() {
  const { state, setActivity, hydrated } = useFormState();
  const router = useRouter();
  const accent = getAccent(state.berani);

  const dayOpt = useMemo(() => findActiveDayOption(state.day), [state.day]);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.berani) router.replace("/");
    else if (!state.day) router.replace("/kapan");
    else if (needsLocationPage(dayOpt) && !state.location) router.replace("/lokasi");
    else if (needsInviteesPage(state.berani) && state.invitees.length === 0) router.replace("/siapa");
  }, [hydrated, state.berani, state.day, state.location, state.invitees.length, dayOpt, router]);

  useEffect(() => {
    router.prefetch("/pesan");
  }, [router]);

  const options = allowedActivities({
    berani: state.berani,
    day: dayOpt,
    location: state.location,
    invitees: state.invitees,
  });

  const backHref = (() => {
    if (needsInviteesPage(state.berani)) return "/siapa";
    if (needsLocationPage(dayOpt)) return "/lokasi";
    return "/kapan";
  })();

  return (
    <PageShell
      page="ngapain"
      title="mau ngapain"
      back={{ href: backHref }}
    >
      <div className="flex flex-col gap-3">
        {options.length === 0 ? (
          <p className="opacity-60">(belom ada pilihan, balik ke halaman sebelumnya)</p>
        ) : null}
        {options.map((key) => {
          const meta = ACTIVITY_LABELS[key];
          const selected = state.activity === key;
          const customBg = meta.bg;
          const customFg = meta.fg ?? "#ffffff";
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActivity(key);
                router.push("/pesan");
              }}
              className="option-card"
              data-selected={selected}
              style={{
                background: customBg,
                color: customBg ? customFg : selected ? accent : undefined,
                borderColor: selected ? accent : customBg ? "transparent" : undefined,
                outline: selected ? `2px solid ${accent}` : "none",
                outlineOffset: 2,
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 4,
              }}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{meta.emoji}</span>
                <span>{meta.label}</span>
                {meta.mapsUrl ? (
                  <a
                    href={meta.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm opacity-40 hover:opacity-80"
                  >📍</a>
                ) : null}
              </span>
              {meta.note ? (
                <span className="pl-10 text-xs opacity-70">{meta.note}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}
