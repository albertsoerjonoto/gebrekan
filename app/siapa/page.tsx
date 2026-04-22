"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/lib/nav";
import {
  INVITEE_LABELS,
  allowedInvitees,
  getAccent,
  needsInviteesPage,
  needsLocationPage,
} from "@/lib/options";
import { useFormState } from "@/lib/state";

export default function SiapaPage() {
  const { state, toggleInvitee, hydrated } = useFormState();
  const router = useRouter();
  const accent = getAccent(state.berani);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.berani) router.replace("/");
    else if (!state.day) router.replace("/kapan");
    else if (needsLocationPage(state.day) && !state.location) router.replace("/lokasi");
    else if (!needsInviteesPage(state.berani)) router.replace("/ngapain");
  }, [hydrated, state.berani, state.day, state.location, router]);

  const options = allowedInvitees(state.day, state.location);
  const backHref = needsLocationPage(state.day) ? "/lokasi" : "/kapan";

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
          return (
            <button
              key={key}
              type="button"
              onClick={() => toggleInvitee(key)}
              className="option-card"
              data-selected={selected}
              style={{
                borderColor: selected ? accent : undefined,
                color: selected ? accent : undefined,
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
                  borderColor: selected ? accent : "var(--border)",
                  background: selected ? accent : "transparent",
                  color: "#fff",
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
