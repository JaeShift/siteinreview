"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { SingleCard } from "@/lib/singles-data";
import styles from "./FeaturedInventory.module.css";

export default function MobileFeaturedCards({ products, onOpen, renderDetails }: {
  products: SingleCard[];
  onOpen: (card: SingleCard, control: HTMLButtonElement) => void;
  renderDetails: (card: SingleCard) => ReactNode;
}) {
  const id = useId();
  const rail = useRef<HTMLDivElement>(null);
  const count = products.length;
  const loop = count > 1;
  const [activeId, setActiveId] = useState(products[0]?.id);
  const activeIndex = Math.max(0, products.findIndex(card => card.id === activeId));
  const [activeSlot, setActiveSlot] = useState(loop ? count : 0);
  const currentIndex = useRef(activeIndex);
  const currentSlot = useRef(activeSlot);
  currentIndex.current = activeIndex;

  const centerSlot = useCallback((slot: number, smooth: boolean) => {
    const element = rail.current;
    const card = element?.children[slot] as HTMLElement | undefined;
    if (!element || !card) return;
    const bounds = element.getBoundingClientRect();
    const box = card.getBoundingClientRect();
    element.scrollTo({ left: element.scrollLeft + box.left + box.width / 2 - bounds.left - element.clientWidth / 2,
      behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "instant" });
  }, []);

  function selectCard(index: number) {
    const choices = loop ? [index, index + count, index + count * 2] : [index];
    const nearest = choices.reduce((best, slot) => Math.abs(slot - currentSlot.current) < Math.abs(best - currentSlot.current) ? slot : best);
    centerSlot(nearest, true);
  }

  useEffect(() => {
    const element = rail.current;
    if (!element || !count) return;
    let frame = 0, resizeFrame = 0, width = 0;
    let settleTimer: ReturnType<typeof setTimeout>;
    let resizing = false, pointerDown = false;
    const measure = () => {
      if (resizing || !element.clientWidth) return;
      const center = element.getBoundingClientRect().left + element.clientWidth / 2;
      let closest = 0, distance = Infinity;
      Array.from(element.children).forEach((card, slot) => {
        const box = card.getBoundingClientRect();
        const delta = Math.abs(box.left + box.width / 2 - center);
        if (delta < distance) { distance = delta; closest = slot; }
      });
      currentSlot.current = closest;
      currentIndex.current = closest % count;
      setActiveSlot(closest);
      setActiveId(products[closest % count].id);
    };
    const settle = () => {
      if (resizing || pointerDown || !element.clientWidth) return;
      measure();
      const slot = currentSlot.current;
      if (!loop || (slot >= count && slot < count * 2)) return;
      // Identical copies keep both neighbors visible while returning to the middle cycle.
      const middle = count + slot % count;
      const focused = element.children[slot]?.contains(document.activeElement);
      centerSlot(middle, false);
      currentSlot.current = middle;
      setActiveSlot(middle);
      if (focused) element.children[middle]?.querySelector('button')?.focus({ preventScroll: true });
    };
    const scheduleSettle = () => { clearTimeout(settleTimer); settleTimer = setTimeout(settle, 180); };
    const onScroll = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); scheduleSettle(); };
    const onPointerDown = () => { pointerDown = true; clearTimeout(settleTimer); };
    const onPointerUp = () => { pointerDown = false; scheduleSettle(); };
    const observer = new ResizeObserver(() => {
      if (!element.clientWidth || element.clientWidth === width) return;
      width = element.clientWidth;
      resizing = true;
      clearTimeout(settleTimer);
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const slot = (loop ? count : 0) + Math.min(currentIndex.current, count - 1);
        centerSlot(slot, false);
        currentSlot.current = slot;
        setActiveSlot(slot);
        resizeFrame = requestAnimationFrame(() => { resizing = false; measure(); });
      });
    });
    observer.observe(element);
    element.addEventListener("scroll", onScroll, { passive: true });
    element.addEventListener("scrollend", settle);
    element.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", onScroll);
      element.removeEventListener("scrollend", settle);
      element.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      cancelAnimationFrame(frame); cancelAnimationFrame(resizeFrame); clearTimeout(settleTimer);
    };
  }, [products, count, loop, centerSlot]);

  if (!count) return null;
  const slides = loop ? [...products, ...products, ...products] : products;
  return <div className={styles.mobileShowcase}>
    <p id={`${id}-instructions`} className={styles.announcement}>Swipe or use the arrow and card buttons to browse. Left and right arrow keys also move between cards. {loop && "Cards repeat in either direction."}</p>
    <div className={styles.mobileStage}>
    <div ref={rail} id={id} className={styles.mobileRail} role="region" aria-label="Featured Magic cards" aria-roledescription="carousel" aria-describedby={`${id}-instructions`} tabIndex={0} onKeyDown={event => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "Home" || event.key === "End") {
        event.preventDefault(); selectCard(event.key === "Home" ? 0 : count - 1);
      } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        if (loop) centerSlot(currentSlot.current + (event.key === "ArrowRight" ? 1 : -1), true);
      }
    }}>
      {slides.map((card, slot) => {
        const selected = slot === activeSlot;
        return <div key={`${slot}-${card.id}`} className={styles.mobileSlide} role="group" aria-roledescription="slide" aria-label={`${slot % count + 1} of ${count}: ${card.name}`} aria-hidden={!selected}>
          <button className={styles.mobileArtwork} type="button" aria-label={selected ? `View ${card.name} details` : `Select ${card.name}`} tabIndex={selected ? 0 : -1} onClick={event => {
            if (!selected) centerSlot(slot, true);
            else onOpen(card, event.currentTarget);
          }}><Image unoptimized src={card.imageUrl} alt={card.name} fill sizes="(max-width: 390px) 74vw, 290px" draggable={false} /></button>
        </div>;
      })}
    </div>
    {loop && <div className={styles.mobileArrows}>
      <button type="button" aria-label="Previous featured card" aria-controls={id} onClick={() => centerSlot(currentSlot.current - 1, true)}><ArrowLeft size={20} aria-hidden="true" /></button>
      <button type="button" aria-label="Next featured card" aria-controls={id} onClick={() => centerSlot(currentSlot.current + 1, true)}><ArrowRight size={20} aria-hidden="true" /></button>
    </div>}
    </div>
    {loop && <div className={styles.mobileDots} role="group" aria-label="Choose a featured card">
      {products.map((card, index) => <button key={card.id} type="button" aria-label={`Show ${card.name}`} aria-current={index === activeIndex ? "true" : undefined} aria-controls={id} onClick={() => selectCard(index)}><span /></button>)}
    </div>}
    <div className={styles.mobileDetails}>
      {products.map((card, index) => <div key={card.id} className={styles.mobileDetailsPanel} aria-hidden={index !== activeIndex} style={{ visibility: index === activeIndex ? "visible" : "hidden" }}>{renderDetails(card)}</div>)}
    </div>
    <p className={styles.announcement} role="status" aria-live="polite">{`Showing card ${activeIndex + 1} of ${count}: ${products[activeIndex].name}.`}</p>
  </div>;
}
