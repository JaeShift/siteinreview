"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, Check, Expand, RotateCw } from "lucide-react";
import Modal from "@/components/ui/Modal";
import MobileFeaturedCards from "./MobileFeaturedCards";
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
  const trigger = useRef<HTMLButtonElement | null>(null);
  const enlargeButton = useRef<HTMLButtonElement | null>(null);
  const backButton = useRef<HTMLButtonElement | null>(null);
  const cartAfterClose = useRef(false);
  const cartReturnTarget = useRef<HTMLButtonElement | null>(null);
  const cartWasOpen = useRef(cartIsOpen);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(timer.current), []);
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
      {card.quantity <= 0 ? "Sold out" : addedId === card.id ? <><Check size={22} aria-hidden="true" /> Added to cart</> : atLimit(card) ? "All available in cart" : <><svg width="22" height="24" viewBox="0 0 24 26" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 8h14l1 16H4L5 8Z" /><path d="M8 11V6a4 4 0 0 1 8 0v5" /></svg> Add to cart</>}
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
      <MobileFeaturedCards products={products} onOpen={quickView} renderDetails={card => <>
        <h3 className={styles.mobileProductTitle}><button type="button" className={styles.titleButton} onClick={event => quickView(card, event.currentTarget)}><ProductName name={card.name} /></button></h3>
        <div className={styles.mobileBuyRow}><strong>${card.price.toFixed(2)}</strong>{addButton(card)}</div>
        <div className={styles.mobileCartRow}>{inCart(card) > 0 && <span>{inCart(card)} in your cart</span>}{cartAction(card)}</div>
      </>} />
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
