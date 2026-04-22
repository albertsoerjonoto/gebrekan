"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormState } from "./state";
import { getAccent } from "./options";
import { useEffect } from "react";

export function PageShell({
  page,
  title,
  subtitle,
  children,
  back,
  next,
  accent,
  nextDisabled,
}: {
  page: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  back?: { href: string; label?: string };
  next?: { href: string; label?: string };
  accent?: string;
  nextDisabled?: boolean;
}) {
  const { state, track } = useFormState();
  const router = useRouter();
  const resolvedAccent = accent ?? getAccent(state.berani);

  useEffect(() => {
    track({ type: "page_view", page });
  }, [page, track]);

  useEffect(() => {
    if (next && !nextDisabled) router.prefetch(next.href);
    if (back) router.prefetch(back.href);
  }, [next, back, nextDisabled, router]);

  return (
    <div className="flex flex-1 flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold leading-tight" style={{ color: resolvedAccent }}>
          {title}
        </h1>
        {subtitle ? <p className="text-sm opacity-70">{subtitle}</p> : null}
      </header>

      <section className="flex flex-1 flex-col gap-3">{children}</section>

      <footer className="mt-6 flex items-center justify-between gap-3">
        {back ? (
          <Link href={back.href} className="nav-btn" prefetch>
            ← {back.label ?? "balik"}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={nextDisabled ? "#" : next.href}
            className="nav-btn"
            data-variant="primary"
            aria-disabled={nextDisabled}
            style={{ background: resolvedAccent, opacity: nextDisabled ? 0.4 : 1, pointerEvents: nextDisabled ? "none" : "auto" }}
            prefetch
          >
            {next.label ?? "lanjut"} →
          </Link>
        ) : (
          <span />
        )}
      </footer>
    </div>
  );
}
