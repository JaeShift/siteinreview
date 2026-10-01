"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { GOOGLE_CALENDAR_URL } from "@/lib/calendar-embed";
import type { MtgEvent } from "@/lib/events-data";
import { addDays, eventTime, phoenixDate, startOfWeek, upcomingWeekEvents, type TaproomEvent } from "@/lib/taproom-calendar";
import EventStamp from "./EventStamp";
import styles from "./MobileEventsCalendar.module.css";

const labels = { games: "Games", food: "Food", music: "Music", taproom: "Taproom" };
const cache = new Map<string, { events: TaproomEvent[]; expires: number }>();
const pending = new Map<string, Promise<TaproomEvent[]>>();
const dateLabel = (value: string, options: Intl.DateTimeFormatOptions) => new Date(`${value}T12:00:00Z`).toLocaleDateString("en-US", { ...options, timeZone: "UTC" });
const displayTitle = (title: string) => title.replace(/\s+([:;,!?])/g, "$1");

function loadMonth(month: string): Promise<TaproomEvent[]> {
  const saved = cache.get(month);
  if (saved && saved.expires > Date.now()) return Promise.resolve(saved.events);
  const current = pending.get(month);
  if (current) return current;
  const request = fetch(`/api/taproom-calendar?month=${month}`).then(async response => {
    if (!response.ok) throw new Error("Calendar unavailable");
    const data = await response.json();
    if (!Array.isArray(data.events)) throw new Error("Invalid calendar response");
    cache.set(month, { events: data.events, expires: Date.now() + 300000 });
    return data.events as TaproomEvent[];
  }).finally(() => pending.delete(month));
  pending.set(month, request);
  return request;
}

function useMonth(month: string, active: boolean) {
  const [state, setState] = useState<{ month: string; events: TaproomEvent[]; status: "loading" | "ready" | "error" }>({ month, events: [], status: "loading" });
  const [attempt, retry] = useState(0);
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setState({ month, events: [], status: "loading" });
    loadMonth(month).then(events => {
      if (!cancelled) setState({ month, events, status: "ready" });
    }).catch(() => {
      if (!cancelled) setState({ month, events: [], status: "error" });
    });
    return () => { cancelled = true; };
  }, [month, active, attempt]);
  return { ...(state.month === month ? state : { events: [], status: "loading" as const }), retry: () => retry(value => value + 1) };
}

export default function MobileEventsCalendar({ featuredEvents }: { featuredEvents: MtgEvent[] }) {
  const [today, setToday] = useState("");
  const [active, setActive] = useState(false);
  const [week, setWeek] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [now, setNow] = useState(0);
  const [detail, setDetail] = useState<TaproomEvent | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const id = useId();
  const weekData = useMonth(week.slice(0, 7), active && !!week);

  useEffect(() => {
    const syncTime = () => {
      const timestamp = Date.now();
      const date = phoenixDate(new Date(timestamp));
      const currentWeek = startOfWeek(date);
      setToday(date); setNow(timestamp);
      setWeek(value => value < currentWeek ? currentWeek : value);
    };
    syncTime();
    const timer = window.setInterval(syncTime, 60000);
    window.addEventListener("focus", syncTime);
    document.addEventListener("visibilitychange", syncTime);
    const query = window.matchMedia("(max-width: 760px)");
    const update = () => setActive(query.matches);
    update(); query.addEventListener("change", update);
    return () => {
      query.removeEventListener("change", update);
      window.clearInterval(timer);
      window.removeEventListener("focus", syncTime);
      document.removeEventListener("visibilitychange", syncTime);
    };
  }, []);

  useEffect(() => {
    if (!detail || !active) return;
    const element = dialog.current;
    element?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previous; opener.current?.focus(); };
  }, [detail, active]);

  const showDetails = (event: TaproomEvent, target: HTMLElement) => { opener.current = target; setDetail(event); };
  const changeWeek = (amount: number) => {
    const currentWeek = startOfWeek(phoenixDate());
    setWeek(value => {
      const next = addDays(value, amount * 7);
      return next < currentWeek ? currentWeek : next;
    });
    setExpanded(false);
  };
  const onDialogKey = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]');
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  const errorMessage = (retry: () => void) => <div className={styles.message} role="status"><strong>The schedule is taking a breather.</strong><p>Try again, or check the live Google calendar.</p><button type="button" onClick={retry}>Try again</button><a href={GOOGLE_CALENDAR_URL} target="_blank" rel="noreferrer">Open calendar <ArrowUpRight size={14} /></a></div>;

  const weekEnd = week ? addDays(week, 6) : "";
  const weeklyEvents = upcomingWeekEvents(weekData.events, week, now);
  const visibleEvents = expanded ? weeklyEvents : weeklyEvents.slice(0, 4);

  return <div className={styles.mobile}>
    <header className={styles.heading}>
      <p className={styles.eyebrow}><span>Beer. Games. Good company.</span></p>
      <h2 id="mobile-events-title">This week<span>at Kitsune.</span></h2>
      <p className={styles.intro}>Your next night out starts here.</p>
    </header>

    <div className={styles.weekNav} aria-label="Choose a week">
      <button type="button" aria-label="Previous week" onClick={() => changeWeek(-1)} disabled={!week || !today || week <= startOfWeek(today)}><ChevronLeft size={19} /></button>
      <span aria-live="polite"><small>Lineup · Phoenix time</small><strong>{week ? `${dateLabel(week, { month: "short", day: "numeric" })} – ${dateLabel(weekEnd, { month: "short", day: "numeric" })}` : "This week"}</strong></span>
      <button type="button" aria-label="Next week" onClick={() => changeWeek(1)} disabled={!week || week >= "2099-12-24"}><ChevronRight size={19} /></button>
    </div>
    {today && week !== startOfWeek(today) && <button className={styles.reset} type="button" onClick={() => { setWeek(startOfWeek(today)); setExpanded(false); }}>Back to this week</button>}

    <div aria-busy={weekData.status === "loading"}>
      {weekData.status === "loading" ? <div className={styles.loading} role="status">Loading this week’s happenings…</div> : weekData.status === "error" ? errorMessage(weekData.retry) : weeklyEvents.length === 0 ? <div className={styles.message}><strong>A little room for spontaneity.</strong><p>No upcoming events left this week. Browse next week or come by for a pour.</p></div> : <ul className={styles.weekList} id={`${id}-week`}>
        {visibleEvents.map(event => <li key={event.id}>
          <button type="button" className={styles.eventRow} data-kind={event.kind} data-today={event.date === today || undefined} onClick={e => showDetails(event, e.currentTarget)}>
            <time dateTime={event.date} className={styles.dateStamp}><span>{dateLabel(event.date, { month: "short" })}</span><strong>{dateLabel(event.date, { day: "2-digit" })}</strong><span>{dateLabel(event.date, { weekday: "short" })}</span></time>
            <span className={styles.eventCopy}><strong>{displayTitle(event.title)}</strong><span className={styles.eventTime}>{eventTime(event)}</span></span>
            <ChevronRight className={styles.rowArrow} size={16} aria-hidden="true" />
          </button>
        </li>)}
      </ul>}
    </div>
    {weekData.status === "ready" && weeklyEvents.length > 4 && <button type="button" className={styles.showAll} aria-expanded={expanded} aria-controls={`${id}-week`} onClick={() => setExpanded(value => !value)}>{expanded ? "Show fewer events" : `All ${weeklyEvents.length} upcoming events`}<ArrowDown size={15} style={{ transform: expanded ? "rotate(180deg)" : undefined }} aria-hidden="true" /></button>}

    {featuredEvents.length > 0 && <div className={styles.registration}><p className={styles.eyebrow}>Tickets & registration</p>{featuredEvents.map(event => <Link key={event.slug} href={event.format === "Prerelease" ? "/pre-release" : `/events/${event.slug}`}><span><strong>{displayTitle(event.title)}</strong><span>{dateLabel(event.date, { month: "short", day: "numeric" })} · {event.time}{Number.isFinite(event.entryFee) && ` · ${event.entryFee === 0 ? "Free" : `$${event.entryFee.toFixed(2)}`}`}</span></span><ArrowUpRight size={18} aria-hidden="true" /></Link>)}</div>}

    {detail && active && <dialog ref={dialog} className={styles.dialog} aria-labelledby={`${id}-detail-title`} onKeyDown={onDialogKey} onCancel={event => { event.preventDefault(); setDetail(null); }} onClick={event => { if (event.target === event.currentTarget) setDetail(null); }}>
      <div className={styles.dialogBody}><button type="button" className={styles.close} onClick={() => setDetail(null)} aria-label="Close event details" autoFocus><X size={22} /></button><span className={`${styles.detailIcon} ${styles[detail.kind]}`}><EventStamp kind={detail.kind} /></span><p className={styles.eyebrow}>{labels[detail.kind]} at Kitsune</p><h3 id={`${id}-detail-title`}>{displayTitle(detail.title)}</h3><p className={styles.detailDate}>{dateLabel(detail.date, { weekday: "long", month: "long", day: "numeric" })}<br />{eventTime(detail)}{!detail.allDay && detail.end > detail.start ? ` – ${new Date(detail.end).toLocaleTimeString("en-US", { timeZone: "America/Phoenix", hour: "numeric", minute: "2-digit" }).replace(":00", "")}` : ""} · Phoenix time</p>{detail.description && <p className={styles.detailDescription}>{detail.description}</p>}<p className={styles.detailLocation}>{detail.location || "Kitsune Brewing Co. · North Phoenix"}</p>{/commander/i.test(detail.title) && <Link href="/commander-nights" className={styles.detailAction}>Explore Commander <ArrowUpRight size={17} /></Link>}<a className={styles.detailAction} href={`${GOOGLE_CALENDAR_URL}&dates=${detail.date.replaceAll("-", "")}/${addDays(detail.date, 1).replaceAll("-", "")}`} target="_blank" rel="noreferrer">View in Google Calendar <ArrowUpRight size={17} /></a></div>
    </dialog>}
  </div>;
}
