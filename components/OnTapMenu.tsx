"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { MenuItem, MenuCategory } from "@/lib/menu-data";
import styles from "./OnTapMenu.module.css";

interface OnTapMenuProps {
  menuData: Record<MenuCategory, MenuItem[]>;
  menuCategories: MenuCategory[];
}

const TAPLIST_IMG = "https://newmedia.taplist.io/img/glassware";

function slugify(cat: string) {
  return cat.toLowerCase().replace(/\s+/g, "-");
}

export default function OnTapMenu({ menuData, menuCategories }: OnTapMenuProps) {
  const [activeSection, setActiveSection] = useState<MenuCategory>("On Tap");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Track which section is currently visible via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const observers: IntersectionObserver[] = [];

    menuCategories.forEach((cat) => {
      const el = container.querySelector(`#menu-${slugify(cat)}`);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(cat as MenuCategory);
        },
        {
          root: container,
          // trigger when the heading crosses the top 30% of the scroll area
          rootMargin: "0px 0px -70% 0px",
          threshold: 0,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  // menuCategories is stable (set once from server); intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the active pill visible in the pill bar
  useEffect(() => {
    const bar = pillsRef.current;
    if (!bar) return;
    const active = bar.querySelector(`[data-cat="${activeSection}"]`) as HTMLElement | null;
    active?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [activeSection]);

  // Focus search input when it opens
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const allItems = menuCategories.flatMap((cat) =>
    menuData[cat as MenuCategory].map((item) => ({ ...item, category: cat as MenuCategory }))
  );

  const filteredItems = searchQuery.trim()
    ? allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.brewery.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.style ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  function toggleSearch() {
    setSearchOpen((prev) => !prev);
    setSearchQuery("");
  }

  function jumpTo(cat: MenuCategory) {
    const container = scrollRef.current;
    const section = container?.querySelector(`#menu-${slugify(cat)}`) as HTMLElement | null;
    if (container && section) {
      const containerRect = container.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const scrollTop = container.scrollTop + (sectionRect.top - containerRect.top);
      container.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }

  return (
    <div className={styles.menuCard}>
      {/* Sticky header: icon + "Main Menu" + section pills */}
      <div className={styles.menuHeader}>
        <span className={styles.menuIcon}>
          {/* beer mug SVG matching Taplist */}
          <svg width="26" height="26" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true">
            <path d="M353.5 103c12.5 10.6 28.8 17 46.5 17 39.8 0 72-32.2 72-72s-32.2-72-72-72c-17.7 0-33.9 6.4-46.5 17-9.3 7.9-32.1 7.4-40.7-1.3-14.5-14.6-34.6-23.7-56.8-23.7s-42.3 9.1-56.8 23.7C190.6.4 167.8.9 158.5-7 145.9-17.6 129.7-24 112-24 72.2-24 40 8.2 40 48s32.2 72 72 72c17.7 0 33.9-6.4 46.5-17 9.3-7.9 32.1-7.4 40.7 1.3 14.5 14.6 34.6 23.7 56.8 23.7s42.3-9.1 56.8-23.7c8.6-8.7 31.4-9.2 40.7-1.3zM64 158v258c0 53 43 96 96 96h192c53 0 96-43 96-96v-17.2l97-48.5c19-9.5 31-28.9 31-50.1V184c0-30.9-25.1-56-56-56h-30.6c-22 24.6-53.9 40-89.4 40v215.5c0 .3 0 .7 0 1v31.5c0 26.5-21.5 48-48 48H160c-26.5 0-48-21.5-48-48V168c-17.1 0-33.3-3.6-48-10z"/>
          </svg>
        </span>
        <span className={styles.menuTitle}>Main Menu</span>

        {/* Scrollable pill bar */}
        <div className={styles.pillBar} ref={pillsRef} role="navigation" aria-label="Jump to section">
          {/* Search pill */}
          <button
            className={`${styles.pill} ${searchOpen ? styles.pillActive : ""}`}
            onClick={toggleSearch}
            aria-label="Search menu"
          >
            <svg width="12" height="12" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true">
              <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/>
            </svg>
          </button>

          {/* Inline search input */}
          {searchOpen && (
            <input
              ref={searchInputRef}
              className={styles.searchInput}
              type="text"
              placeholder="Search drinks…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search drinks"
            />
          )}

          {/* Category pills — hidden while searching */}
          {!searchOpen && menuCategories.map((cat) => (
            <button
              key={cat}
              data-cat={cat}
              className={`${styles.pill} ${activeSection === cat ? styles.pillActive : ""}`}
              onClick={() => jumpTo(cat as MenuCategory)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list — all sections stacked, or filtered search results */}
      <div className={styles.menuScroll} ref={scrollRef}>
        {searchQuery.trim() ? (
          /* ── Search results ── */
          filteredItems.length > 0 ? (
            <section className={styles.categorySection}>
              <h2 className={styles.categoryHeading}>Results for &ldquo;{searchQuery}&rdquo;</h2>
              <div className={styles.itemCard}>
                <ul className={styles.itemList}>
                  {filteredItems.map((item) => (
                    <li key={`${item.name}-${item.brewery}`} className={styles.item}>
                      <div className={styles.itemContent}>
                        <h5 className={styles.itemTitle}>
                          <span className={styles.itemName}>{item.name}</span>{" "}
                          <small className={styles.itemBrewery}>{item.brewery}</small>
                        </h5>
                        {(item.style || item.abv || item.srm) && (
                          <ul className={styles.metaList}>
                            {item.style && <li>{item.style}</li>}
                            {item.abv && <li>ABV {item.abv}</li>}
                            {item.srm && <li>SRM {item.srm}</li>}
                          </ul>
                        )}
                        <div className={styles.priceRow}>
                          <span className={styles.itemSize}>{item.size}</span>
                          <span className={styles.dottedLine} aria-hidden="true" />
                          <span className={styles.itemPrice}>{item.price}</span>
                        </div>
                      </div>
                      <div className={styles.glassWrap}>
                        <Image
                          src={`${TAPLIST_IMG}/${item.glassType}?color=${item.glassColor}`}
                          alt={`A visualization of the menu item "${item.name}"`}
                          width={128}
                          height={128}
                          className={styles.glassImg}
                          unoptimized
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : (
            <p className={styles.noResults}>No drinks matched &ldquo;{searchQuery}&rdquo;</p>
          )
        ) : (
          /* ── Normal category sections ── */
          menuCategories.map((cat) => (
            <section key={cat} id={`menu-${slugify(cat)}`} className={styles.categorySection}>
              <h2 className={styles.categoryHeading}>{cat}</h2>

              <div className={styles.itemCard}>
                <ul className={styles.itemList}>
                  {menuData[cat as MenuCategory].map((item) => (
                    <li key={`${item.name}-${item.brewery}`} className={styles.item}>
                      <div className={styles.itemContent}>
                        <h5 className={styles.itemTitle}>
                          <span className={styles.itemName}>{item.name}</span>{" "}
                          <small className={styles.itemBrewery}>{item.brewery}</small>
                        </h5>

                        {(item.style || item.abv || item.srm) && (
                          <ul className={styles.metaList}>
                            {item.style && <li>{item.style}</li>}
                            {item.abv && <li>ABV {item.abv}</li>}
                            {item.srm && <li>SRM {item.srm}</li>}
                          </ul>
                        )}

                        <div className={styles.priceRow}>
                          <span className={styles.itemSize}>{item.size}</span>
                          <span className={styles.dottedLine} aria-hidden="true" />
                          <span className={styles.itemPrice}>{item.price}</span>
                        </div>
                      </div>

                      <div className={styles.glassWrap}>
                        <Image
                          src={`${TAPLIST_IMG}/${item.glassType}?color=${item.glassColor}`}
                          alt={`A visualization of the menu item "${item.name}"`}
                          width={128}
                          height={128}
                          className={styles.glassImg}
                          unoptimized
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))
        )}

        <p className={styles.lastUpdated}>
          Last updated: <time dateTime="2026-06-22">June 22, 2026</time>
        </p>
      </div>
    </div>
  );
}
