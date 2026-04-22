"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

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

  if (!scene || failed) return null;

  return (
    <div key={scene} className="meerkat-wrap" aria-hidden="true">
      <img
        src={`/meerkat/${scene}-a.jpg`}
        alt=""
        className="meerkat-frame meerkat-a"
        onError={() => setFailed(true)}
      />
      <img
        src={`/meerkat/${scene}-b.jpg`}
        alt=""
        className="meerkat-frame meerkat-b"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
