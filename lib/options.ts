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
  | "rabu_depan"
  | "jumat_depan"
  | "senin_depan";

export type DayTime = "AM" | "PM" | "late PM";
export type DayCategory = "weekend" | "weekday";
export type DayTone = "day" | "night" | "midnight";

export const DAY_OPTIONS: {
  key: DayKey;
  label: string;
  emoji: string;
  time: DayTime;
  category: DayCategory;
  tone: DayTone;
}[] = [
  // chronological order from today (Mon 2026-04-27):
  // jumat ini = Fri 1 May, sabtu ini = Sat 2 May, minggu ini = Sun 3 May,
  // senin depan = Mon 4 May, rabu depan = Wed 6 May, jumat depan = Fri 8 May.
  { key: "jumat_ini", label: "jumat ini", emoji: "☀️", time: "AM", category: "weekend", tone: "day" },
  { key: "sabtu_ini", label: "sabtu ini", emoji: "☀️", time: "AM", category: "weekend", tone: "day" },
  { key: "minggu_ini", label: "minggu ini", emoji: "☀️", time: "AM", category: "weekend", tone: "day" },
  { key: "senin_depan", label: "senin depan", emoji: "🌑", time: "late PM", category: "weekday", tone: "midnight" },
  { key: "rabu_depan", label: "rabu depan", emoji: "🌔", time: "PM", category: "weekday", tone: "night" },
  { key: "jumat_depan", label: "jumat depan", emoji: "🌕", time: "PM", category: "weekday", tone: "night" },
  { key: "senin_depan", label: "senin depan", emoji: "🌑", time: "late PM", category: "weekday", tone: "midnight" },
];

export type LocationKey = "jakarta" | "karawaci";

export const LOCATION_LABELS: Record<LocationKey, { label: string; emoji: string }> = {
  jakarta: { label: "jakarta", emoji: "🏙️" },
  karawaci: { label: "karawaci", emoji: "🏠" },
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
  | "michael";

export const INVITEE_LABELS: Record<InviteeKey, { label: string; emoji: string }> = {
  goltox: { label: "goltox", emoji: "🧈" },
  sales_alsut: { label: "sales alsut", emoji: "😇" },
  tante_pona: { label: "tante pona", emoji: "🐷" },
  om_dom: { label: "om dom", emoji: "😱" },
  macan: { label: "macan", emoji: "🐯" },
  weirdoalien: { label: "weirdoalien", emoji: "👽" },
  deedee_foodie: { label: "deedee foodie", emoji: "🍝" },
  ada_dech: { label: "ada dech", emoji: "🤨" },
  michael: { label: "michael", emoji: "👶" },
};

export type ActivityKey =
  | "karting_jakarta"
  | "karting_karawaci"
  | "bouncestreet"
  | "masak_rumah"
  | "nyapu_pel"
  | "jalan_mall"
  | "timezone_karawaci"
  | "faunaland"
  | "jetski"
  | "skorz"
  | "little_frenchie"
  | "bouchon"
  | "juliette"
  | "mata_karanjang"
  | "pizza_4p"
  | "isabella_steakhouse"
  | "suara_restaurant"
  | "manzo"
  | "sophilia"
  | "singapolah"
  | "j_sparrow"
  | "broadway"
  | "triple_h";

export const ACTIVITY_LABELS: Record<ActivityKey, { label: string; emoji: string; note?: string; mapsUrl?: string }> = {
  karting_jakarta: { label: "karting", emoji: "🏎️", mapsUrl: "https://www.google.com/maps/search/Speedy+Karting+Plaza+Semanggi+Jakarta" },
  karting_karawaci: { label: "karting", emoji: "🏎️", mapsUrl: "https://www.google.com/maps/search/Playtopia+Sports+Supermal+Karawaci" },
  bouncestreet: { label: "bouncestreet asia", emoji: "🤸‍♂️", mapsUrl: "https://www.google.com/maps/search/BounceStreet+Asia+Bintaro" },
  masak_rumah: { label: "masak di rumah", emoji: "🍳" },
  nyapu_pel: { label: "nyapu pel rumah", emoji: "🧹" },
  jalan_mall: { label: "jalan2 ke mall", emoji: "🏬", mapsUrl: "https://www.google.com/maps/place/Supermal+Karawaci/@-6.226959,106.6050183,17z/data=!3m1!4b1!4m5!3m4!1s0x2e69fc1fa03eb34d:0xf630dc3815cc7464!8m2!3d-6.226959!4d106.607207" },
  timezone_karawaci: { label: "timezone karawaci", emoji: "🎢", mapsUrl: "https://www.google.com/maps/search/Timezone+Supermal+Karawaci" },
  faunaland: { label: "faunaland", emoji: "🐘", mapsUrl: "https://www.google.com/maps/search/Faunaland+Ancol+Ecopark+Jakarta" },
  jetski: { label: "jetski", emoji: "🚤", mapsUrl: "https://www.google.com/maps/search/Seadoo+Safari+Jakarta+Marina+Ancol" },
  skorz: { label: "skorz", emoji: "🔫", mapsUrl: "https://www.google.com/maps/search/SKORZ+Sportainment+fX+Sudirman+Jakarta" },
  little_frenchie: { label: "little frenchie", emoji: "🇫🇷", mapsUrl: "https://www.google.com/maps/search/Little+Frenchie+Jl+Taman+MPU+Sendok+9+Kebayoran+Baru+Jakarta" },
  bouchon: { label: "bouchon", emoji: "🥖", mapsUrl: "https://www.google.com/maps/search/Bouchon+Jakarta+Jl+Senopati+No+79+Selong+Kebayoran+Baru" },
  juliette: { label: "juliette", emoji: "🍝", mapsUrl: "https://www.google.com/maps/search/Juliette+the+Kitchen+Menara+Astra+Sudirman+Jakarta" },
  mata_karanjang: { label: "mata karanjang", emoji: "👀", mapsUrl: "https://www.google.com/maps/search/Mata+Karanjang+Jl+Wijaya+VI+No+14A+Melawai+Kebayoran+Baru+Jakarta" },
  pizza_4p: { label: "pizza 4p", emoji: "🧀", mapsUrl: "https://maps.app.goo.gl/B4KZUYt1u4Y9ND477" },
  isabella_steakhouse: { label: "isabella", emoji: "🥩", mapsUrl: "https://www.google.com/maps/search/Isabella+Steakhouse+Jl+Wolter+Monginsidi+67A+Kebayoran+Baru+Jakarta" },
  suara_restaurant: { label: "suara", emoji: "🐔", mapsUrl: "https://maps.app.goo.gl/u739AspVNgj9yfhz8" },
  manzo: { label: "manzo", emoji: "🎷", mapsUrl: "https://www.google.com/maps/search/Manzo+Jakarta+Jl+Wijaya+II+No+28+Melawai+Kebayoran+Baru" },
  sophilia: { label: "sophilia", emoji: "🖼️", mapsUrl: "https://maps.app.goo.gl/wtta4hQ39o19GvjH6" },
  singapolah: { label: "singapolah", emoji: "🤪", mapsUrl: "https://www.google.com/maps/search/Singapolah+SCBD+Jl+Jenderal+Sudirman+Kav+58+Jakarta+Selatan" },
  j_sparrow: { label: "j.sparrow", emoji: "🏴‍☠️" },
  broadway: { label: "broadway", emoji: "🎭" },
  triple_h: { label: "triple H", emoji: "🍹" },
};

export function isWeekend(day: DayKey | null | undefined): boolean {
  return day === "sabtu_ini" || day === "minggu_ini" || day === "jumat_ini";
}
export function isMingguOrJumat(day: DayKey | null | undefined): boolean {
  return day === "minggu_ini" || day === "jumat_ini";
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
  return ["jakarta", "karawaci"];
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
    const list: InviteeKey[] = ["goltox", "sales_alsut", "tante_pona", "om_dom", "macan"];
    if (isMingguOrJumat(day)) list.push("michael");
    return list;
  }
  if (location === "jakarta") {
    const list: InviteeKey[] = ["goltox", "sales_alsut", "weirdoalien", "deedee_foodie", "ada_dech"];
    if (isMingguOrJumat(day)) list.push("michael");
    return list;
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

  if (day === "senin_depan") return ["j_sparrow", "broadway", "triple_h"];

  if (berani === "udh_haha") {
    if (isWeekday(day)) {
      const acts: ActivityKey[] = ["pizza_4p", "isabella_steakhouse", "suara_restaurant"];
      if (day === "jumat_depan") acts.push("manzo");
      acts.push("singapolah");
      return acts;
    }
    if (effLoc === "jakarta") {
      const acts: ActivityKey[] = ["faunaland", "jetski", "karting_jakarta", "skorz"];
      if (day === "minggu_ini") acts.push("sophilia");
      return acts;
    }
    if (effLoc === "karawaci") {
      return ["karting_karawaci", "bouncestreet", "timezone_karawaci", "masak_rumah", "nyapu_pel", "jalan_mall"];
    }
    return [];
  }

  if (isWeekday(day)) {
    const hasGoltox = invitees.includes("goltox");
    const hasAndreaOrChristine = invitees.some((i) =>
      (["deedee_foodie", "weirdoalien"] as InviteeKey[]).includes(i),
    );
    const hasBoth = hasGoltox && hasAndreaOrChristine;
    const out: ActivityKey[] = [];
    if (hasGoltox) out.push("little_frenchie");
    if (hasAndreaOrChristine) out.push("bouchon");
    if (hasGoltox) out.push("juliette");
    if (hasAndreaOrChristine) out.push("mata_karanjang");
    if ((hasAndreaOrChristine || hasGoltox) && !hasBoth) out.push("suara_restaurant");
    if (day === "jumat_depan") out.push("manzo");
    if (!hasBoth) out.push("singapolah");
    return out;
  }

  if (effLoc === "karawaci") {
    const hasTantePona = invitees.includes("tante_pona");
    const hasOmDom = invitees.includes("om_dom");
    const base: ActivityKey[] = ["karting_karawaci", "bouncestreet", "timezone_karawaci", "masak_rumah", "nyapu_pel", "jalan_mall"];
    return base.filter((a) => {
      if (a === "karting_karawaci" || a === "bouncestreet") return !(hasTantePona || hasOmDom);
      if (a === "nyapu_pel") return hasTantePona || hasOmDom;
      return true;
    });
  }
  if (effLoc === "jakarta") {
    const acts: ActivityKey[] = ["faunaland", "jetski", "karting_jakarta", "skorz"];
    if (day === "minggu_ini") acts.push("sophilia");
    return acts;
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
