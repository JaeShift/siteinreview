"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/ui/SearchBar";
import FilterSidebar from "@/components/mtg/FilterSidebar";
import SingleCard from "@/components/mtg/SingleCard";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { useCart } from "@/lib/cart-context";
import { filterSingles, type SinglesFilters, type SingleCard as SingleCardData } from "@/lib/singles-data";
import styles from "./singles.module.css";

const PAGE_SIZE = 15;

const DEFAULT_FILTERS: SinglesFilters = {
  search: "",
  sets: [],
  conditions: [],
  colors: [],
  colorIdentity: [],
  types: [],
  rarities: [],
  formats: [],
  availability: [],
  foilOnly: false,
  minPrice: 0,
  maxPrice: 0,
  power: "",
  toughness: "",
  cmc: "",
  oracle: "",
  sort: "name-asc",
};


export default function SinglesClient({ initialCards = [] }: { initialCards?: SingleCardData[] }) {
  return <SinglesInner initialCards={initialCards} />;
}

function SinglesInner({ initialCards }: { initialCards: SingleCardData[] }) {
  const [filters, setFilters] = useState<SinglesFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { totalCount, openCart } = useCart();

  const filtered = useMemo(() => filterSingles(initialCards, filters), [initialCards, filters]);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleFiltersChange = (newFilters: SinglesFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    handleFiltersChange({ ...filters, search: value });
  };

  return (
    <>
      <div className={styles.page}>
        {/* Mobile bar */}
        <div className={styles.mobileBar}>
          <SearchBar
            value={filters.search}
            onChange={handleSearch}
            placeholder="Search cards…"
            className={styles.mobileSearch}
          />
          <button
            className={`btn btn-outline ${styles.filterToggleBtn}`}
            onClick={() => setSidebarOpen((v) => !v)}
          >
            Filters {filtered.length !== initialCards.length ? `(${filtered.length})` : ""}
          </button>
        </div>

        <div className={`container ${styles.layout}`}>
          {/* Sidebar */}
          <div className={`${styles.sidebarWrap} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
            <FilterSidebar
              filters={filters}
              onChange={handleFiltersChange}
              totalResults={filtered.length}
            />
          </div>

          {/* Main */}
          <div className={styles.main}>
            {/* Desktop search */}
            <div className={styles.desktopSearch}>
              <SearchBar
                value={filters.search}
                onChange={handleSearch}
                placeholder="Search by card name, set…"
                className={styles.searchBar}
              />
            </div>

            {/* Results count */}
            <div className={styles.resultsInfo}>
              <h2 className={styles.inventoryHeading}>Kitsune Card Inventory</h2>
              <div className={styles.resultsRight}>
                <span className={styles.resultCount}>
                  Showing {filtered.length} result{filtered.length !== 1 ? "s" : ""}
                  {totalPages > 1 && ` — Page ${page} of ${totalPages}`}
                </span>
                {totalPages > 1 && (
                  <div className={styles.topPager}>
                    <button
                      className={styles.topPagerBtn}
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page === 1}
                      aria-label="Previous page"
                    >‹</button>
                    <span className={styles.topPagerNum}>{page} / {totalPages}</span>
                    <button
                      className={styles.topPagerBtn}
                      onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      disabled={page === totalPages}
                      aria-label="Next page"
                    >›</button>
                  </div>
                )}
              </div>
            </div>

            {paginated.length > 0 ? (
              <>
                <div className={styles.grid}>
                  {paginated.map((card) => (
                    <SingleCard key={card.id} card={card} />
                  ))}
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                />
              </>
            ) : (
              <EmptyState
                title="No Cards Found"
                message="Try adjusting your filters or search query."
                action={
                  <button
                    className="btn btn-outline"
                    onClick={() => handleFiltersChange(DEFAULT_FILTERS)}
                  >
                    Clear All Filters
                  </button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={`container ${styles.newsletterInner}`}>
          <div className={styles.newsletterText}>
            <h2 className={styles.newsletterHeading}>NEVER MISS A DROP.</h2>
            <p className={styles.newsletterBody}>
              Join the Kitsune Inner Circle for first access to rare singles, prerelease kits, and exclusive MTG events.
            </p>
          </div>
          <div className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              className={styles.newsletterInput}
              aria-label="Email address"
            />
            <button className={styles.newsletterBtn}>SUBSCRIBE</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.shopFooter}>
        <p className={styles.shopFooterName}>Kitsune Brewing Company</p>
        <div className={styles.shopFooterLinks}>
          <a href="tel:+16022458593" className={styles.shopFooterLink}>(602) 245-8593</a>
          <a href="http://instagram.com/kitsunebrewingco" target="_blank" rel="noopener noreferrer" className={styles.shopFooterLink}>Instagram</a>
          <a href="https://www.facebook.com/KitsuneBrewCo" target="_blank" rel="noopener noreferrer" className={styles.shopFooterLink}>Facebook</a>
        </div>
        <p className={styles.shopFooterCopy}>
          &copy; {new Date().getFullYear()} Kitsune Brewing Company. 3321 E Bell Rd Suite B-5 Phoenix, AZ 85032
        </p>
      </footer>

      {/* Floating cart */}
      <button
        className={styles.cartFab}
        onClick={openCart}
        aria-label={`Open cart — ${totalCount} item${totalCount !== 1 ? "s" : ""}`}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {totalCount > 0 && <span className={styles.cartBadge}>{totalCount}</span>}
      </button>
    </>
  );
}
