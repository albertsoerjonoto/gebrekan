"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SCENE_BY_PATH: Record<string, string> = {
  "/": "berani",
  "/kapan": "kapan",
  "/lokasi": "lokasi",
  "/siapa": "siapa",
  "/ngapain": "ngapain",
  "/pesan": "pesan",
  "/done": "done",
};

export function MeerkatDoll() {
  const pathname = usePathname();
  const scene = pathname ? SCENE_BY_PATH[pathname] : undefined;
  const [failed, setFailed] = useState(false);
  const [loadedA, setLoadedA] = useState(false);
  const [loadedB, setLoadedB] = useState(false);

  useEffect(() => {
    setLoadedA(false);
    setLoadedB(false);
    setFailed(false);
  }, [scene]);

  if (!scene || failed) return null;

  const ready = loadedA && loadedB;

  return (
    <div
      key={scene}
      className="meerkat-wrap"
      data-scene={scene}
      data-ready={ready ? "1" : "0"}
      aria-hidden="true"
    >
      <img
        src={`/meerkat/${scene}-a.png`}
        alt=""
        className="meerkat-frame meerkat-a"
        decoding="async"
        // @ts-expect-error fetchpriority is a valid HTML attr not yet in React types
        fetchpriority="high"
        onLoad={() => setLoadedA(true)}
        onError={() => setFailed(true)}
      />
      <img
        src={`/meerkat/${scene}-b.png`}
        alt=""
        className="meerkat-frame meerkat-b"
        decoding="async"
        // @ts-expect-error fetchpriority is a valid HTML attr not yet in React types
        fetchpriority="high"
        onLoad={() => setLoadedB(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
