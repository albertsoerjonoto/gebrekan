"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/lib/nav";
import {
  INVITEE_LABELS,
  allowedInvitees,
  getAccent,
  needsInviteesPage,
  needsLocationPage,
} from "@/lib/options";
import { findActiveDayOption } from "@/lib/dayOptions";
import { useFormState } from "@/lib/state";

export default function SiapaPage() {
  const { state, toggleInvitee, hydrated } = useFormState();
  const router = useRouter();
  const accent = getAccent(state.berani);

  const dayOpt = useMemo(() => findActiveDayOption(state.day), [state.day]);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.berani) router.replace("/");
    else if (!state.day) router.replace("/kapan");
    else if (needsLocationPage(dayOpt) && !state.location) router.replace("/lokasi");
    else if (!needsInviteesPage(state.berani)) router.replace("/ngapain");
  }, [hydrated, state.berani, state.day, state.location, dayOpt, router]);

  const options = allowedInvitees(dayOpt, state.location);
  const backHref = needsLocationPage(dayOpt) ? "/lokasi" : "/kapan";

  return (
    <PageShell
      page="siapa"
      title="mau ajak siapa"
      subtitle="bisa banyak woi"
      back={{ href: backHref }}
      next={{ href: "/ngapain" }}
      nextDisabled={state.invitees.length === 0}
    >
      <div className="flex flex-col gap-3">
        {options.map((key) => {
          const meta = INVITEE_LABELS[key];
          const selected = state.invitees.includes(key);
          const customBg = meta.bg;
          const customFg = meta.fg ?? "#ffffff";
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleInvitee(key)}
              className="option-card"
              data-selected={selected}
              style={{
                background: customBg,
                color: customBg ? customFg : selected ? accent : undefined,
                borderColor: selected ? accent : customBg ? "transparent" : undefined,
                outline: selected ? `2px solid ${accent}` : "none",
                outlineOffset: 2,
              }}
            >
              <span className="flex items-center gap-3">
                <span className="text-2xl">{meta.emoji}</span>
                <span>{meta.label}</span>
              </span>
              <span
                aria-hidden
                className="flex h-6 w-6 items-center justify-center rounded-full border"
                style={{
                  borderColor: customBg ? customFg : selected ? accent : "var(--border)",
                  background: selected ? (customBg ? customFg : accent) : "transparent",
                  color: selected ? (customBg ?? "#fff") : "transparent",
                }}
              >
                {selected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}
