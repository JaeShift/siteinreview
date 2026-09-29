"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Expand, Plus, RotateCw } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { useCart } from "@/lib/cart-context";
import { formatCondition, formatSetDisplay, type SingleCard } from "@/lib/singles-data";
import styles from "./FeaturedInventory.module.css";

function ProductName({ name }: { name: string }) {
  const [front, ...reverse] = name.split("//").map(face => face.trim());
  return <><span>{front}</span>{reverse.length > 0 && <span className={styles.secondaryName}>{reverse.join(" // ")}</span>}</>;
}

export default function FeaturedInventory({ products }: { products: SingleCard[] }) {
  const { addToCart, items, openCart, isOpen: cartIsOpen } = useCart();
  const [selected, setSelected] = useState<SingleCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [enlarged, setEnlarged] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [browseAnnouncement, setBrowseAnnouncement] = useState("");
  const [browsePosition, setBrowsePosition] = useState({ first: 0, last: 0, atStart: true, atEnd: products.length < 2 });
  const rail = useRef<HTMLDivElement | null>(null);
  const railId = useId();
  const trigger = useRef<HTMLButtonElement | null>(null);
  const enlargeButton = useRef<HTMLButtonElement | null>(null);
  const backButton = useRef<HTMLButtonElement | null>(null);
  const cartAfterClose = useRef(false);
  const cartReturnTarget = useRef<HTMLButtonElement | null>(null);
  const cartWasOpen = useRef(cartIsOpen);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    let frame = 0;
    let settleTimer: ReturnType<typeof setTimeout>;

    function measure(announce = false) {
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const cards = Array.from(element.children) as HTMLElement[];
      const visible = cards.map((card, index) => {
        const cardBounds = card.getBoundingClientRect();
        const visibleWidth = Math.min(cardBounds.right, bounds.right) - Math.max(cardBounds.left, bounds.left);
        return visibleWidth >= cardBounds.width * .6 ? index : -1;
      }).filter(index => index !== -1);
      const nearest = cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left - bounds.left) < Math.abs(cards[best].getBoundingClientRect().left - bounds.left) ? index : best, 0);
      const first = visible[0] ?? nearest;
      const last = visible[visible.length - 1] ?? first;
      const atStart = element.scrollLeft <= 2;
      const atEnd = element.scrollWidth - element.clientWidth - element.scrollLeft <= 2;
      setBrowsePosition(previous => previous.first === first && previous.last === last && previous.atStart === atStart && previous.atEnd === atEnd ? previous : { first, last, atStart, atEnd });
      if (announce && cards.length) setBrowseAnnouncement(first === last ? `Showing card ${first + 1} of ${cards.length}.` : `Showing cards ${first + 1} to ${last + 1} of ${cards.length}.`);
    }

    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => measure());
      clearTimeout(settleTimer);
      settleTimer = setTimeout(() => measure(true), 180);
    }

    const resizeObserver = new ResizeObserver(() => measure());
    resizeObserver.observe(element);
    element.addEventListener("scroll", onScroll, { passive: true });
    frame = requestAnimationFrame(() => measure());
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(settleTimer);
      resizeObserver.disconnect();
      element.removeEventListener("scroll", onScroll);
    };
  }, [products]);
  useEffect(() => {
    if (enlarged) backButton.current?.focus();
  }, [enlarged]);
  useEffect(() => {
    if (selected !== null || !cartAfterClose.current) return;
    cartAfterClose.current = false;
    openCart();
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[aria-label="Shopping cart"] button[aria-label="Close cart"]')?.focus());
  }, [selected, openCart]);
  useEffect(() => {
    const cartJustClosed = cartWasOpen.current && !cartIsOpen;
    cartWasOpen.current = cartIsOpen;
    if (!cartJustClosed || !cartReturnTarget.current) return;
    const returnTarget = cartReturnTarget.current;
    cartReturnTarget.current = null;
    requestAnimationFrame(() => {
      if (returnTarget.isConnected) returnTarget.focus();
      else if (trigger.current?.isConnected) trigger.current.focus();
    });
  }, [cartIsOpen]);

  const inCart = (card: SingleCard) => items.find(item => item.card.id === card.id)?.quantity ?? 0;
  const atLimit = (card: SingleCard) => inCart(card) >= card.quantity;

  function browseTo(index: number) {
    const element = rail.current;
    const card = element?.children[Math.max(0, Math.min(index, products.length - 1))] as HTMLElement | undefined;
    if (!element || !card) return;
    const left = card.getBoundingClientRect().left - element.getBoundingClientRect().left + element.scrollLeft - 5;
    element.scrollTo({ left: Math.max(0, Math.min(left, element.scrollWidth - element.clientWidth)), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function quickView(card: SingleCard, control: HTMLButtonElement) {
    trigger.current = control;
    setFlipped(false);
    setEnlarged(false);
    setSelected(card);
  }

  function add(card: SingleCard) {
    if (atLimit(card)) return;
    addToCart(card);
    setAddedId(card.id);
    setAnnouncement(`${card.name} added to your cart.`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAddedId(null), 1800);
  }

  function close() {
    setSelected(null);
    setEnlarged(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  function exitEnlargement() {
    setEnlarged(false);
    requestAnimationFrame(() => enlargeButton.current?.focus());
  }

  function viewCart(control: HTMLButtonElement) {
    cartReturnTarget.current = selected ? trigger.current : control;
    if (selected) {
      cartAfterClose.current = true;
      setEnlarged(false);
      setSelected(null);
    } else {
      openCart();
      requestAnimationFrame(() => document.querySelector<HTMLButtonElement>('[aria-label="Shopping cart"] button[aria-label="Close cart"]')?.focus());
    }
  }

  const addButton = (card: SingleCard) => (
    <button type="button" className={styles.addButton} disabled={atLimit(card)} onClick={() => add(card)} aria-label={`Add ${card.name} to cart`}>
      {addedId === card.id ? <><Check size={16} aria-hidden="true" /> Added to cart</> : atLimit(card) ? "All available in cart" : <>Add to cart <Plus size={16} aria-hidden="true" /></>}
    </button>
  );
  const cartAction = (card: SingleCard) => inCart(card) > 0 && (
    <button type="button" className={styles.viewCart} onClick={event => viewCart(event.currentTarget)}>View cart <ArrowUpRight size={14} aria-hidden="true" /></button>
  );
  const flipButton = selected?.backImageUrl && (
    <button type="button" className={styles.imageControl} onClick={() => setFlipped(value => !value)}>
      <RotateCw size={15} aria-hidden="true" /> {flipped ? "Show front face" : "Show back face"}
    </button>
  );
  const selectedImage = selected && (flipped && selected.backImageUrl ? selected.backImageUrl : selected.imageUrl);
  const selectedImageName = selected && (flipped ? selected.backName || `${selected.name}, reverse face` : selected.name);

  return (
    <div className={styles.featured} onKeyDownCapture={event => {
      if (event.key === "Escape" && enlarged) {
        event.preventDefault();
        event.stopPropagation();
        exitEnlargement();
      }
    }}>
      <p id={`${railId}-instructions`} className={styles.announcement}>Use the left and right arrow keys to browse cards. Home and End move to the first and last cards.</p>
      <div ref={rail} id={railId} className={styles.grid} role="region" aria-label="Featured Magic cards" aria-roledescription="carousel" aria-describedby={`${railId}-instructions`} tabIndex={0} onKeyDown={event => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); browseTo(browsePosition.first - 1); }
        else if (event.key === "ArrowRight") { event.preventDefault(); browseTo(browsePosition.first + 1); }
        else if (event.key === "Home") { event.preventDefault(); browseTo(0); }
        else if (event.key === "End") { event.preventDefault(); browseTo(products.length - 1); }
      }}>
        {products.map((card, index) => (
          <article className={styles.product} key={card.id} aria-label={`${index + 1} of ${products.length}: ${card.name}`} aria-roledescription="slide">
            <button className={styles.viewButton} type="button" aria-label={`Quick view ${card.name}`} onClick={event => quickView(card, event.currentTarget)}>
              <span className={styles.artwork}>
                <Image unoptimized src={card.imageUrl} alt={card.name} fill sizes="(max-width: 380px) 55vw, (max-width: 760px) 38vw, (max-width: 960px) 40vw, 24vw" />
                <span className={styles.quickView}>Quick view <ArrowUpRight size={15} aria-hidden="true" /></span>
              </span>
            </button>
            <div className={styles.productCopy}>
              <h3 className={styles.productTitle}><button type="button" className={styles.titleButton} onClick={event => quickView(card, event.currentTarget)}><ProductName name={card.name} /></button></h3>
              <p className={styles.set}>{formatSetDisplay(card.set, card.setCode, card.collectorNumber)}</p>
              <div className={styles.meta}>
                <span>{formatCondition(card.condition)}<span className={styles.finish}>{card.foil ? "Foil" : "Non-foil"}</span></span>
                <strong>${card.price.toFixed(2)}</strong>
              </div>
              {addButton(card)}
              <div className={styles.stockRow}><span>{card.quantity} available</span>{cartAction(card)}</div>
            </div>
          </article>
        ))}
      </div>
      {products.length > 0 && <div className={styles.browseControls}>
        <p className={styles.browseCount}><span>{String(browsePosition.first + 1).padStart(2, "0")}{browsePosition.last > browsePosition.first && `–${String(browsePosition.last + 1).padStart(2, "0")}`}</span><span className={styles.countDivider}>/</span>{String(products.length).padStart(2, "0")}<span className={styles.browseHint}>Featured singles</span></p>
        {(!browsePosition.atStart || !browsePosition.atEnd) && <div className={styles.browseButtons}>
          <button type="button" aria-label="Previous featured cards" aria-controls={railId} disabled={browsePosition.atStart} onClick={() => browseTo(browsePosition.first - 1)}><ArrowLeft size={20} aria-hidden="true" /></button>
          <button type="button" aria-label="Next featured cards" aria-controls={railId} disabled={browsePosition.atEnd} onClick={() => browseTo(browsePosition.first + 1)}><ArrowRight size={20} aria-hidden="true" /></button>
        </div>}
      </div>}
      <p className={styles.announcement} role="status" aria-live="polite">{browseAnnouncement}</p>
      <p className={styles.announcement} role="status" aria-live="polite">{announcement}</p>
      <Modal isOpen={selected !== null} onClose={close} title={enlarged ? "Card artwork" : "A closer look"} size="lg">
        <p className={styles.announcement} role="status" aria-live="polite">{announcement}</p>
        {selected && selectedImage && selectedImageName && (enlarged ? (
          <div className={styles.enlarged}>
            <div className={styles.enlargedToolbar}>
              <button ref={backButton} type="button" className={styles.imageControl} onClick={exitEnlargement}><ArrowLeft size={16} aria-hidden="true" /> Back to details</button>
              {flipButton}
            </div>
            <div className={styles.enlargedImage}><Image unoptimized src={selectedImage} alt={selectedImageName} fill sizes="(max-width: 600px) 85vw, 600px" /></div>
            <p className={styles.imageCaption}>{selectedImageName}</p>
          </div>
        ) : (
          <div className={styles.detail}>
            <div className={styles.detailArtwork}>
              <button ref={enlargeButton} type="button" className={styles.enlargeButton} onClick={() => setEnlarged(true)} aria-label={`Enlarge image of ${selectedImageName}`}>
                <span className={styles.detailImage}><Image unoptimized src={selectedImage} alt={selectedImageName} fill sizes="(max-width: 600px) 75vw, 360px" /></span>
                <span className={styles.enlargeHint}><Expand size={15} aria-hidden="true" /> Enlarge image</span>
              </button>
              {flipButton}
            </div>
            <div className={styles.detailCopy}>
              <p className={styles.detailKicker}>Magic at Kitsune</p>
              <h3>{selected.name}</h3>
              <p className={styles.detailSet}>{formatSetDisplay(selected.set, selected.setCode, selected.collectorNumber)}</p>
              <dl>
                <div><dt>Condition</dt><dd>{formatCondition(selected.condition)}</dd></div>
                <div><dt>Finish</dt><dd>{selected.foil ? "Foil" : "Non-foil"}</dd></div>
                {selected.rarity && <div><dt>Rarity</dt><dd>{selected.rarity}</dd></div>}
                <div><dt>Available</dt><dd>{selected.quantity}</dd></div>
              </dl>
              <strong className={styles.detailPrice}>${selected.price.toFixed(2)}</strong>
              {addButton(selected)}
              <div className={styles.detailCart}>{inCart(selected) > 0 && <span>{inCart(selected)} in your cart</span>}{cartAction(selected)}</div>
              {(flipped ? selected.backOracleText : selected.oracleText) && <div className={styles.rules}><span className={styles.rulesLabel}>{flipped ? "Reverse face" : "Card details"}</span><p className={styles.rulesText}>{flipped ? selected.backOracleText : selected.oracleText}</p></div>}
            </div>
          </div>
        ))}
      </Modal>
    </div>
  );
}
