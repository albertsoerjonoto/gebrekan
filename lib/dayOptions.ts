export type DayTime = "AM" | "PM" | "late PM";
export type DayCategory = "weekend" | "weekday";
export type DayTone = "day" | "night" | "midnight";

export type DayOption = {
  key: string;
  label: string;
  emoji: string;
  time: DayTime;
  category: DayCategory;
  tone: DayTone;
  dayOfWeek: number;
  dayOfMonth: number;
  isMonday: boolean;
  isSunday: boolean;
  isFriday: boolean;
  isHoliday: boolean;
};

// Indonesian national public holidays — extend as official decrees come in.
// Wrong/missing dates only mis-classify a day's tone/time, never break the page.
export const ID_HOLIDAYS: ReadonlySet<string> = new Set<string>([
  "2026-05-14", // Kenaikan Isa Almasih
  "2026-05-21", // Hari Raya Waisak
  "2026-05-27", // Iduladha
  "2026-06-01", // Hari Lahir Pancasila
  "2026-06-17", // Tahun Baru Islam
  "2026-08-17", // HUT RI
  "2026-08-26", // Maulid Nabi
  "2026-12-25", // Natal
  "2027-01-01", // Tahun Baru Masehi
  "2027-02-06", // Imlek
  "2027-03-09", // Nyepi
  "2027-03-19", // Isra Mi'raj
  "2027-03-26", // Wafat Isa Almasih
  "2027-05-01", // Hari Buruh
  "2027-05-13", // Kenaikan Isa Almasih
  "2027-05-16", // Iduladha
  "2027-05-17", // Cuti bersama Iduladha
  "2027-06-01", // Hari Lahir Pancasila
  "2027-06-06", // Tahun Baru Islam
  "2027-08-15", // Maulid Nabi
  "2027-08-17", // HUT RI
  "2027-12-25", // Natal
]);

const DAY_NAMES_ID = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"] as const;

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function isoOf(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

export function getJakartaToday(now: Date = new Date()): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const y = Number(parts.find((p) => p.type === "year")?.value);
  const m = Number(parts.find((p) => p.type === "month")?.value);
  const d = Number(parts.find((p) => p.type === "day")?.value);
  return { y, m, d };
}

function dayOfWeekUTC(y: number, m: number, d: number): number {
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function addDaysUTC(y: number, m: number, d: number, delta: number): { y: number; m: number; d: number } {
  const t = new Date(Date.UTC(y, m - 1, d));
  t.setUTCDate(t.getUTCDate() + delta);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

function startOfWeekMondayUTC(y: number, m: number, d: number): { y: number; m: number; d: number } {
  const dow = dayOfWeekUTC(y, m, d);
  const offset = dow === 0 ? -6 : 1 - dow;
  return addDaysUTC(y, m, d, offset);
}

function classify(dayOfWeek: number, isHoliday: boolean): {
  category: DayCategory;
  time: DayTime;
  tone: DayTone;
  emoji: string;
} {
  const isWeekendDay = dayOfWeek === 0 || dayOfWeek === 6;
  if (isWeekendDay || isHoliday) {
    return { category: "weekend", time: "AM", tone: "day", emoji: "☀️" };
  }
  if (dayOfWeek === 1) {
    return { category: "weekday", time: "late PM", tone: "midnight", emoji: "🌑" };
  }
  if (dayOfWeek === 5) {
    return { category: "weekday", time: "PM", tone: "night", emoji: "🌕" };
  }
  return { category: "weekday", time: "PM", tone: "night", emoji: "🌔" };
}

function buildDayOption(
  iso: string,
  y: number,
  m: number,
  d: number,
  todayWeekStartIso: string,
): DayOption {
  const dow = dayOfWeekUTC(y, m, d);
  const isHoliday = ID_HOLIDAYS.has(iso);
  const c = classify(dow, isHoliday);

  const wkStart = startOfWeekMondayUTC(y, m, d);
  const wkStartIso = isoOf(wkStart.y, wkStart.m, wkStart.d);
  const suffix = wkStartIso === todayWeekStartIso ? "ini" : "depan";
  const dayName = DAY_NAMES_ID[dow];

  return {
    key: iso,
    label: `${dayName} ${suffix}`,
    emoji: c.emoji,
    time: c.time,
    category: c.category,
    tone: c.tone,
    dayOfWeek: dow,
    dayOfMonth: d,
    isMonday: dow === 1,
    isSunday: dow === 0,
    isFriday: dow === 5,
    isHoliday,
  };
}

export function getActiveDayOptions(now: Date = new Date()): DayOption[] {
  const today = getJakartaToday(now);
  const todayWkStart = startOfWeekMondayUTC(today.y, today.m, today.d);
  const todayWkStartIso = isoOf(todayWkStart.y, todayWkStart.m, todayWkStart.d);

  const out: DayOption[] = [];
  for (let i = 1; i <= 7; i++) {
    const { y, m, d } = addDaysUTC(today.y, today.m, today.d, i);
    const iso = isoOf(y, m, d);
    const opt = buildDayOption(iso, y, m, d, todayWkStartIso);
    if (opt.category === "weekday" && opt.dayOfMonth % 2 !== 0) continue;
    out.push(opt);
  }
  return out;
}

export function findActiveDayOption(
  key: string | null | undefined,
  now: Date = new Date(),
): DayOption | null {
  if (!key) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) return null;
  return getActiveDayOptions(now).find((o) => o.key === key) ?? null;
}
