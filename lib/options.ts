export const COLORS = {
  bossy: "#CE3D66",
  french: "#0072BB",
  night: "#0f1930",
  dayOrange: "#ffd89b",
  yellow: "#ffe58a",
} as const;

export type BeraniKey = "udh_haha" | "ngeri_woi" | "yee_apansi" | "gtw_de" | "wew";

export const BERANI_OPTIONS: { key: BeraniKey; label: string; bg: string; fg: string }[] = [
  { key: "udh_haha", label: "udh HAHA", bg: "#CE3D66", fg: "#ffffff" },
  { key: "ngeri_woi", label: "ngeri woi", bg: "#9A4A7B", fg: "#ffffff" },
  { key: "yee_apansi", label: "yee apansi", bg: "#675890", fg: "#ffffff" },
  { key: "gtw_de", label: "gtw de", bg: "#3365A6", fg: "#ffffff" },
  { key: "wew", label: "wew", bg: "#0072BB", fg: "#ffffff" },
];

export type DayKey =
  | "jumat_ini"
  | "sabtu_ini"
  | "minggu_ini"
  | "selasa_depan"
  | "kamis_depan";

export type DayTime = "AM" | "PM";
export type DayCategory = "weekend" | "weekday";

export const DAY_OPTIONS: {
  key: DayKey;
  label: string;
  emoji: string;
  time: DayTime;
  category: DayCategory;
  tone: "night" | "day";
}[] = [
  { key: "jumat_ini", label: "jumat ini", emoji: "🌓", time: "PM", category: "weekday", tone: "night" },
  { key: "sabtu_ini", label: "sabtu ini", emoji: "☀️", time: "AM", category: "weekend", tone: "day" },
  { key: "minggu_ini", label: "minggu ini", emoji: "☀️", time: "AM", category: "weekend", tone: "day" },
  { key: "selasa_depan", label: "selasa depan", emoji: "🌔", time: "PM", category: "weekday", tone: "night" },
  { key: "kamis_depan", label: "kamis depan", emoji: "🌕", time: "PM", category: "weekday", tone: "night" },
];

export type LocationKey = "jakarta" | "karawaci" | "bekasi";

export const LOCATION_LABELS: Record<LocationKey, { label: string; emoji: string }> = {
  jakarta: { label: "jakarta", emoji: "🏙️" },
  karawaci: { label: "karawaci", emoji: "🏠" },
  bekasi: { label: "bekasi", emoji: "❄️" },
};

export type InviteeKey =
  | "goltox"
  | "sales_alsut"
  | "tante_pona"
  | "om_dom"
  | "macan"
  | "weirdoalien"
  | "deedee_foodie"
  | "ada_dech"
  | "ngikut_michael";

export const INVITEE_LABELS: Record<InviteeKey, { label: string; emoji: string }> = {
  goltox: { label: "goltox", emoji: "🧈" },
  sales_alsut: { label: "sales alsut", emoji: "😇" },
  tante_pona: { label: "tante pona", emoji: "🐷" },
  om_dom: { label: "om dom", emoji: "😱" },
  macan: { label: "macan", emoji: "🐯" },
  weirdoalien: { label: "weirdoalien", emoji: "👽" },
  deedee_foodie: { label: "deedee foodie", emoji: "🍝" },
  ada_dech: { label: "ada dech", emoji: "🤨" },
  ngikut_michael: { label: "ngikut michael aja", emoji: "👶" },
};

export type ActivityKey =
  | "karting"
  | "bouncestreet"
  | "padel"
  | "masak_rumah"
  | "nyapu_pel"
  | "jalan_mall"
  | "timezone_karawaci"
  | "faunaland"
  | "jetski"
  | "skorz"
  | "little_frenchie"
  | "bouchon"
  | "pbtp"
  | "mata_karanjang"
  | "amanaia_satrio"
  | "trans_snow"
  | "pizza_4p"
  | "nonna_bona"
  | "le_quartier"
  | "txoko_senop"
  | "vong_kitchen"
  | "babylon_garden";

export const ACTIVITY_LABELS: Record<ActivityKey, { label: string; emoji: string; note?: string }> = {
  karting: { label: "karting", emoji: "🏎️" },
  bouncestreet: { label: "bouncestreet asia", emoji: "🤸‍♂️" },
  padel: { label: "padel lucu", emoji: "🏓" },
  masak_rumah: { label: "masak di rumah", emoji: "🍳" },
  nyapu_pel: { label: "nyapu pel rumah", emoji: "🧹" },
  jalan_mall: { label: "jalan2 ke mall", emoji: "🏬" },
  timezone_karawaci: { label: "timezone karawaci", emoji: "🎢" },
  faunaland: { label: "faunaland", emoji: "🐘" },
  jetski: { label: "jetski", emoji: "🚤" },
  skorz: { label: "skorz", emoji: "🔫" },
  little_frenchie: { label: "little frenchie", emoji: "🇫🇷" },
  bouchon: { label: "bouchon", emoji: "🥖" },
  pbtp: { label: "PBTP urban trattoria", emoji: "🍝" },
  mata_karanjang: { label: "mata karanjang", emoji: "👀" },
  amanaia_satrio: { label: "amanaia satrio", emoji: "🍲" },
  trans_snow: { label: "trans snow studio bekasi", emoji: "⛷️", note: "with michael and friends" },
  pizza_4p: { label: "pizza 4p", emoji: "🧀" },
  nonna_bona: { label: "nonna bona", emoji: "🍝" },
  le_quartier: { label: "le quartier", emoji: "🥩" },
  txoko_senop: { label: "txoko senop", emoji: "🥘" },
  vong_kitchen: { label: "vong kitchen", emoji: "🍕" },
  babylon_garden: { label: "babylon garden affair", emoji: "🥂" },
};

export function isWeekend(day: DayKey | null | undefined): boolean {
  return day === "sabtu_ini" || day === "minggu_ini";
}
export function isMinggu(day: DayKey | null | undefined): boolean {
  return day === "minggu_ini";
}
export function isWeekday(day: DayKey | null | undefined): boolean {
  return !!day && !isWeekend(day);
}

export function getAccent(berani: BeraniKey | null | undefined): string {
  return berani === "udh_haha" ? COLORS.bossy : COLORS.french;
}

export function needsLocationPage(day: DayKey | null | undefined): boolean {
  return isWeekend(day);
}

export function needsInviteesPage(berani: BeraniKey | null | undefined): boolean {
  return !!berani && berani !== "udh_haha";
}

export function allowedLocations(day: DayKey | null | undefined): LocationKey[] {
  if (!isWeekend(day)) return [];
  const base: LocationKey[] = ["jakarta", "karawaci"];
  if (isMinggu(day)) base.push("bekasi");
  return base;
}

export function allowedInvitees(
  day: DayKey | null | undefined,
  location: LocationKey | null | undefined,
): InviteeKey[] {
  if (isWeekday(day)) {
    return ["goltox", "weirdoalien", "deedee_foodie", "ada_dech"];
  }
  if (!isWeekend(day)) return [];
  if (location === "karawaci") {
    return ["goltox", "sales_alsut", "tante_pona", "om_dom", "macan"];
  }
  if (location === "jakarta") {
    return ["goltox", "sales_alsut", "weirdoalien", "deedee_foodie", "ada_dech"];
  }
  if (location === "bekasi") {
    return ["goltox", "sales_alsut", "macan", "ngikut_michael"];
  }
  return [];
}

export function effectiveLocation(
  day: DayKey | null | undefined,
  location: LocationKey | null | undefined,
): LocationKey | "scbd" | null {
  if (isWeekday(day)) return "scbd";
  if (isWeekend(day) && location) return location;
  return null;
}

export function allowedActivities(opts: {
  berani: BeraniKey | null | undefined;
  day: DayKey | null | undefined;
  location: LocationKey | null | undefined;
  invitees: InviteeKey[];
}): ActivityKey[] {
  const { berani, day, location, invitees } = opts;
  const effLoc = effectiveLocation(day, location);

  if (effLoc === "bekasi") return ["trans_snow"];

  if (berani === "udh_haha") {
    if (isWeekday(day)) return ["pizza_4p", "nonna_bona", "le_quartier", "txoko_senop", "vong_kitchen", "babylon_garden"];
    if (effLoc === "jakarta") return ["faunaland", "jetski", "karting", "skorz"];
    if (effLoc === "karawaci") {
      return ["karting", "timezone_karawaci", "bouncestreet", "masak_rumah", "nyapu_pel", "jalan_mall"];
    }
    return [];
  }

  if (isWeekday(day)) {
    const hasGoltox = invitees.includes("goltox");
    const hasAndreaOrChristine = invitees.some((i) =>
      (["deedee_foodie", "weirdoalien"] as InviteeKey[]).includes(i),
    );
    const out: ActivityKey[] = [];
    if (hasGoltox) out.push("little_frenchie");
    if (hasAndreaOrChristine) out.push("bouchon");
    if (hasGoltox) out.push("pbtp");
    if (hasAndreaOrChristine) out.push("mata_karanjang", "amanaia_satrio");
    out.push("babylon_garden");
    return out;
  }

  if (effLoc === "karawaci") {
    return ["karting", "bouncestreet", "padel", "masak_rumah", "nyapu_pel", "jalan_mall"];
  }
  if (effLoc === "jakarta") {
    return ["faunaland", "jetski", "karting", "skorz"];
  }
  return [];
}

export function isFlowComplete(state: {
  berani: BeraniKey | null;
  day: DayKey | null;
  location: LocationKey | null;
  invitees: InviteeKey[];
  activity: ActivityKey | null;
}): boolean {
  if (!state.berani) return false;
  if (!state.day) return false;
  if (needsLocationPage(state.day) && !state.location) return false;
  if (needsInviteesPage(state.berani) && state.invitees.length === 0) return false;
  if (!state.activity) return false;
  return true;
}
