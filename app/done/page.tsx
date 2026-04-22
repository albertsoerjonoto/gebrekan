"use client";

import Link from "next/link";
import { useFormState } from "@/lib/state";
import { getAccent } from "@/lib/options";

export default function DonePage() {
  const { state, reset } = useFormState();
  const accent = getAccent(state.berani);

  return (
    <div className="flex min-h-[70dvh] flex-col items-center justify-center gap-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: accent, color: "#fff", fontSize: 36 }}
      >
        ✓
      </div>
      <h1 className="text-3xl font-semibold" style={{ color: accent }}>
        kecatet!
      </h1>
      <p className="max-w-xs opacity-70">
        makasih ya 🥹 gw bakal kabarin balik sesuai pilihan lo.
      </p>
      <div className="flex gap-3">
        <Link href="/" className="nav-btn" onClick={() => reset()}>
          mulai lagi
        </Link>
        <Link href="/pesan" className="nav-btn" data-variant="primary" style={{ background: accent, color: "#fff" }}>
          ubah jawaban
        </Link>
      </div>
    </div>
  );
}
