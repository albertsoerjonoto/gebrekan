"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/lib/nav";
import {
  LOCATION_LABELS,
  allowedLocations,
  getAccent,
  needsInviteesPage,
  needsLocationPage,
} from "@/lib/options";
import { useFormState } from "@/lib/state";

const LOC_STYLES: Record<string, { bg: string; fg: string; gradient?: string }> = {
  jakarta: {
    bg: "#111827",
    fg: "#ffffff",
    gradient:
      "linear-gradient(180deg, #0b1020 0%, #1f2a44 55%, #2a3a63 100%), radial-gradient(circle at 20% 80%, rgba(255,220,120,0.35) 0 6%, transparent 7%), radial-gradient(circle at 35% 75%, rgba(255,220,120,0.25) 0 4%, transparent 5%), radial-gradient(circle at 60% 78%, rgba(255,220,120,0.3) 0 5%, transparent 6%), radial-gradient(circle at 80% 82%, rgba(255,220,120,0.2) 0 4%, transparent 5%)",
  },
  karawaci: {
    bg: "#f5e7c4",
    fg: "#3b2a12",
    gradient:
      "linear-gradient(180deg, #fff3d6 0%, #f5e7c4 100%), radial-gradient(circle at 80% 20%, rgba(255,200,100,0.5) 0 15%, transparent 16%)",
  },
  bekasi: {
    bg: "#e9f4ff",
    fg: "#0b2545",
    gradient:
      "linear-gradient(180deg, #f7fbff 0%, #d6e8ff 100%), radial-gradient(circle at 15% 30%, #ffffff 0 6%, transparent 7%), radial-gradient(circle at 40% 20%, #ffffff 0 5%, transparent 6%), radial-gradient(circle at 70% 35%, #ffffff 0 4%, transparent 5%), radial-gradient(circle at 90% 25%, #ffffff 0 5%, transparent 6%)",
  },
};

export default function LokasiPage() {
  const { state, setLocation, hydrated } = useFormState();
  const router = useRouter();
  const accent = getAccent(state.berani);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.berani) router.replace("/");
    else if (!state.day) router.replace("/kapan");
    else if (!needsLocationPage(state.day)) {
      router.replace(needsInviteesPage(state.berani) ? "/siapa" : "/ngapain");
    }
  }, [hydrated, state.berani, state.day, router]);

  useEffect(() => {
    router.prefetch("/siapa");
    router.prefetch("/ngapain");
  }, [router]);

  const options = allowedLocations(state.day);

  const nextHref = needsInviteesPage(state.berani) ? "/siapa" : "/ngapain";

  return (
    <PageShell
      page="lokasi"
      title="mau dimana"
      back={{ href: "/kapan" }}
    >
      <div className="flex flex-col gap-3">
        {options.map((key) => {
          const meta = LOCATION_LABELS[key];
          const style = LOC_STYLES[key];
          const selected = state.location === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                setLocation(key);
                router.push(nextHref);
              }}
              className="option-card"
              data-selected={selected}
              style={{
                background: style.gradient ?? style.bg,
                color: style.fg,
                borderColor: selected ? accent : "transparent",
                outline: selected ? `2px solid ${accent}` : "none",
                outlineOffset: 2,
                minHeight: 88,
              }}
            >
              <span className="flex items-center gap-3 text-lg font-bold">
                <span className="text-2xl">{meta.emoji}</span>
                <span>{meta.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </PageShell>
  );
}
