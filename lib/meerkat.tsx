type SceneKey = "berani" | "kapan" | "lokasi" | "siapa" | "ngapain" | "pesan" | "done";

type Scene = {
  a: string;
  b: string;
  alt: string;
  width: number;
  aspectRatio: string;
};

const SCENES: Record<SceneKey, Scene> = {
  berani: {
    a: "/meerkat/berani-a.png",
    b: "/meerkat/berani-b.png",
    alt: "boneka meerkat pakai bomber pink, jempol ke atas",
    width: 132,
    aspectRatio: "692 / 1481",
  },
  kapan: {
    a: "/meerkat/kapan-a.png",
    b: "/meerkat/kapan-b.png",
    alt: "boneka meerkat pakai piyama pegang jam",
    width: 132,
    aspectRatio: "692 / 1481",
  },
  lokasi: {
    a: "/meerkat/lokasi-a.png",
    b: "/meerkat/lokasi-b.png",
    alt: "boneka meerkat petualang pegang peta",
    width: 132,
    aspectRatio: "692 / 1481",
  },
  siapa: {
    a: "/meerkat/siapa-a.png",
    b: "/meerkat/siapa-b.png",
    alt: "boneka meerkat dengan balon melambai",
    width: 132,
    aspectRatio: "692 / 1481",
  },
  ngapain: {
    a: "/meerkat/ngapain-a.png",
    b: "/meerkat/ngapain-b.png",
    alt: "boneka meerkat siap olahraga",
    width: 132,
    aspectRatio: "692 / 1481",
  },
  pesan: {
    a: "/meerkat/pesan-a.png",
    b: "/meerkat/pesan-b.png",
    alt: "boneka meerkat pakai cardigan, pegang notebook",
    width: 132,
    aspectRatio: "692 / 1481",
  },
  done: {
    a: "/meerkat/done-a.png",
    b: "/meerkat/done-b.png",
    alt: "boneka meerkat pakai topi pesta, lompat",
    width: 132,
    aspectRatio: "692 / 1481",
  },
};

export function MeerkatDoll({ scene }: { scene: SceneKey }) {
  const cfg = SCENES[scene];
  return (
    <div
      className="meerkat-doll"
      data-scene={scene}
      style={{ width: cfg.width, aspectRatio: cfg.aspectRatio }}
    >
      <img src={cfg.a} alt={cfg.alt} className="meerkat-frame meerkat-frame-a" />
      <img src={cfg.b} alt="" aria-hidden className="meerkat-frame meerkat-frame-b" />
    </div>
  );
}
