export const TAPROOM_TIME_ZONE = "America/Phoenix";
export const DIRECTIONS_URL = "https://www.google.com/maps/dir/?api=1&destination=Kitsune+Brewing+Company+3321+E+Bell+Rd+Phoenix+AZ";

export type TaproomDay = {
  day: string;
  opens: number | null;
  closes: number | null;
};

// Public listings agree on Tue–Sun. Monday is disputed, so do not guess.
// https://maps.apple.com/place?place-id=ICB60D89D50A4E4CA
// https://wanderlog.com/place/details/6850068/kitsune-brewing-company
export const TAPROOM_HOURS: TaproomDay[] = [
  { day: "Monday", opens: null, closes: null },
  { day: "Tuesday", opens: 15, closes: 21 },
  { day: "Wednesday", opens: 15, closes: 21 },
  { day: "Thursday", opens: 15, closes: 21 },
  { day: "Friday", opens: 14, closes: 21 },
  { day: "Saturday", opens: 12, closes: 21 },
  { day: "Sunday", opens: 12, closes: 18 },
];

export function formatHour(hour: number) {
  return `${hour % 12 || 12}${hour >= 12 ? "pm" : "am"}`;
}

export function formatDayHours(day: TaproomDay) {
  return day.opens === null || day.closes === null
    ? "Please call to confirm"
    : `${formatHour(day.opens)} – ${formatHour(day.closes)}`;
}

export function getTaproomStatus(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TAPROOM_TIME_ZONE, weekday: "long", hour: "numeric", minute: "numeric", hourCycle: "h23",
  }).formatToParts(now);
  const part = (name: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === name)?.value;
  const day = TAPROOM_HOURS.find((entry) => entry.day === part("weekday"));
  if (!day || day.opens === null || day.closes === null) {
    return { label: "Call for today’s hours", hours: "Please confirm Monday hours", open: false, unconfirmed: true };
  }
  const minute = Number(part("hour")) * 60 + Number(part("minute"));
  const open = minute >= day.opens * 60 && minute < day.closes * 60;
  const label = open ? `Open until ${formatHour(day.closes)}`
    : minute < day.opens * 60 ? `Opens today at ${formatHour(day.opens)}` : "Closed for today";
  return { label, hours: `${day.day}: ${formatDayHours(day)}`, open, unconfirmed: false };
}
