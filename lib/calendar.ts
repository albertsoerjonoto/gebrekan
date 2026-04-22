import type { ActivityKey, LocationKey } from "./options";
import { ACTIVITY_LABELS, LOCATION_LABELS } from "./options";

const DOW: Record<string, number> = {
  jumat_ini: 5,
  sabtu_ini: 6,
  minggu_ini: 0,
  selasa_depan: 2,
  kamis_depan: 4,
};

const IS_WEEKEND = new Set(["sabtu_ini", "minggu_ini"]);

export function getEventDates(dayKey: string): { start: Date; end: Date } | null {
  const targetDow = DOW[dayKey];
  if (targetDow === undefined) return null;

  // Compute "today" in WIB (UTC+7)
  const wibNow = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const todayDow = wibNow.getUTCDay();

  let daysAhead = (targetDow - todayDow + 7) % 7;
  if (daysAhead < 1) daysAhead += 7; // never today — always a future date

  const isWeekend = IS_WEEKEND.has(dayKey);
  const startHourWib = isWeekend ? 10 : 19;
  const durationHours = isWeekend ? 3 : 2;

  // Build UTC timestamp: WIB hour - 7 = UTC hour
  const start = new Date(
    Date.UTC(
      wibNow.getUTCFullYear(),
      wibNow.getUTCMonth(),
      wibNow.getUTCDate() + daysAhead,
      startHourWib - 7,
      0,
      0,
    ),
  );
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

  return { start, end };
}

function icsDate(d: Date): string {
  // yyyymmddTHHMMSSZ
  return d.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
}

function icsEscape(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let i = 75; i < line.length; i += 74) parts.push(" " + line.slice(i, i + 74));
  return parts.join("\r\n");
}

export function buildIcs(params: {
  sessionId: string;
  dayKey: string;
  activityKey: string | null;
  locationKey: string | null;
  description: string;
  organizerEmail: string;
  attendees: string[];
}): string | null {
  const dates = getEventDates(params.dayKey);
  if (!dates) return null;

  const actMeta = params.activityKey
    ? ACTIVITY_LABELS[params.activityKey as ActivityKey]
    : null;
  const locMeta = params.locationKey
    ? LOCATION_LABELS[params.locationKey as LocationKey]
    : null;

  const summary = actMeta ? `${actMeta.emoji} ${actMeta.label}` : "gebrekan";
  const location = locMeta ? `${locMeta.emoji} ${locMeta.label}` : "";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//gebrekan//gebrekan//EN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${params.sessionId}@gebrekan`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(dates.start)}`,
    `DTEND:${icsDate(dates.end)}`,
    foldLine(`SUMMARY:${icsEscape(summary)}`),
    ...(location ? [foldLine(`LOCATION:${icsEscape(location)}`)] : []),
    foldLine(`DESCRIPTION:${icsEscape(params.description)}`),
    `ORGANIZER;CN=gebrekan:mailto:${params.organizerEmail}`,
    ...params.attendees.map(
      (e) => `ATTENDEE;RSVP=TRUE;PARTSTAT=NEEDS-ACTION:mailto:${e}`,
    ),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
