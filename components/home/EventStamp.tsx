import type { TaproomEventKind } from "@/lib/taproom-calendar";

/** Original geometric marks for the taproom schedule. */
export default function EventStamp({ kind, className }: { kind: TaproomEventKind | "fox"; className?: string }) {
  return <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square" strokeLinejoin="miter" className={className} aria-hidden="true">
    {kind === "games" && <><path d="m11 12-5 2 7 27 7-2M20 8l-5 1 3 28 7-1" /><rect x="24" y="8" width="18" height="29" rx="1" transform="rotate(8 24 8)" /><path d="m31 16 4 7-6 6-4-7z" /><path d="m27 12 1 .1M33 33l1 .1" /></>}
    {kind === "food" && <><path d="M6 24h36c-2 10-8 15-18 15S8 34 6 24ZM18 40h12M5 20h38M12 15l22-7M13 18l23-5M20 5c-4 3 3 5-1 8M28 3c-4 3 3 5-1 8" /><path d="M11 28c2 4 4 6 8 7" /></>}
    {kind === "music" && <><circle cx="24" cy="24" r="18" /><circle cx="24" cy="24" r="6" /><circle cx="24" cy="24" r="1" fill="currentColor" /><path d="M11 23a13 13 0 0 1 12-12M14 24a10 10 0 0 1 10-10M37 25a13 13 0 0 1-12 12M34 24a10 10 0 0 1-10 10" /></>}
    {kind === "taproom" && <><path d="M11 15h26l-4 27H15l-4-27ZM13 23h22M18 28l1 8" /><path d="M11 15v-4c0-5 6-7 10-3 3-5 10-4 12 0 4-1 6 2 4 7" strokeLinejoin="round" /></>}
    {kind === "fox" && <><path d="m8 6 13 10h6L40 6l-3 20-13 15-13-15z" /><path d="m8 6 9 17-6 3M40 6l-9 17 6 3M14 25l10 10 10-10M18 24l2 2M30 24l-2 2M21 32h6l-3 3z" /><path d="M19 41h10M16 45h16" /></>}
  </svg>;
}
