"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/lib/nav";
import {
  ACTIVITY_LABELS,
  allowedActivities,
  getAccent,
  needsInviteesPage,
  needsLocationPage,
} from "@/lib/options";
import { useFormState } from "@/lib/state";

export default function NgapainPage() {
  const { state, setActivity, hydrated } = useFormState();
  const router = useRouter();
  const accent = getAccent(state.berani);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.berani) router.replace("/");
    else if (!state.day) router.replace("/kapan");
    else if (needsLocationPage(state.day) && !state.location) router.replace("/lokasi");
    else if (needsInviteesPage(state.berani) && state.invitees.length === 0) router.replace("/siapa");
  }, [hydrated, state.berani, state.day, state.location, state.invitees.length, router]);

  const options = allowedActivities({
    berani: state.berani,
    day: state.day,
    location: state.location,
    invitees: state.invitees,
  });

  const backHref = (() => {
    if (needsInviteesPage(state.berani)) return "/siapa";
    if (needsLocationPage(state.day)) return "/lokasi";
    return "/kapan";
  })();

  return (
    <PageShell
      page="ngapain"
      title="milih mau ngapain"
      back={{ href: backHref }}
      next={{ href: "/pesan", label: "lanjut" }}
      nextDisabled={!state.activity}
    >
      <div className="flex flex-col gap-3">
        {options.length === 0 ? (
          <p className="opacity-60">(belom ada pilihan, balik ke halaman sebelumnya)</p>
        ) : null}
        {options.map((key) => {
          const meta = ACTIVITY_LABELS[key];
          const selected = state.activity === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setActivity(key)}
              className="option-card"
              data-selected={selected}
              style={{
                borderColor: selected ? accent : undefined,
                color: selected ? accent : undefined,
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
