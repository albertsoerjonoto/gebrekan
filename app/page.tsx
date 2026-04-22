"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BERANI_OPTIONS } from "@/lib/options";
import { useFormState } from "@/lib/state";

const WIDTHS = ["100%", "86%", "72%", "58%", "44%"];

export default function Page() {
  const { state, setBerani, track, hydrated } = useFormState();
  const router = useRouter();

  useEffect(() => {
    if (hydrated) track({ type: "page_view", page: "berani" });
  }, [hydrated, track]);

  useEffect(() => {
    router.prefetch("/kapan");
  }, [router]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold leading-tight">
          udh berani ketemu berdua lagi belom?
        </h1>
      </header>

      <section className="mt-2 flex flex-1 flex-col items-center gap-3">
        {BERANI_OPTIONS.map((opt, i) => {
          const selected = state.berani === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setBerani(opt.key);
                router.push("/kapan");
              }}
              className="pyramid-btn"
              data-selected={selected}
              style={{
                width: WIDTHS[i],
                background: opt.bg,
                color: opt.fg,
                outline: selected ? "3px solid #fff" : "none",
                outlineOffset: selected ? 2 : 0,
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </section>

    </div>
  );
}
