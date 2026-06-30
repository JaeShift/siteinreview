"use client";

import { useState, useMemo } from "react";
import SearchBar from "@/components/ui/SearchBar";
import FilterSidebar from "@/components/mtg/FilterSidebar";
import SingleCard from "@/components/mtg/SingleCard";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import { singles, filterSingles, type SinglesFilters } from "@/lib/singles-data";
import styles from "./singles.module.css";

const PAGE_SIZE = 12;

const DEFAULT_FILTERS: SinglesFilters = {
  search: "",
  sets: [],
  conditions: [],
  colors: [],
  types: [],
  rarities: [],
  foilOnly: false,
  minPrice: 0,
  maxPrice: 0,
  sort: "name-asc",
};

export default function SinglesClient() {
  const [filters, setFilters] = useState<SinglesFilters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filtered = useMemo(() => filterSingles(singles, filters), [filters]);

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
      <div className="page-banner">
        <h1>Singles</h1>
      </div>

      <div className={styles.page}>
        {/* Mobile filter toggle */}
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
            Filters {filtered.length !== singles.length ? `(${filtered.length})` : ""}
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

          {/* Main content */}
          <div className={styles.main}>
            {/* Desktop search bar */}
            <div className={styles.desktopSearch}>
              <SearchBar
                value={filters.search}
                onChange={handleSearch}
                placeholder="Search by card name, set…"
                className={styles.searchBar}
              />
            </div>

            {/* Results info */}
            <div className={styles.resultsInfo}>
              <span className={styles.resultCount}>
                {filtered.length} card{filtered.length !== 1 ? "s" : ""} found
              </span>
              {page > 1 && (
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
              )}
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

        <div className={styles.disclaimer}>
          <div className="container">
            <p>
              <strong>Note:</strong> Inventory is updated regularly but may not reflect real-time stock.
              Prices subject to change. Contact us at{" "}
              <a href="mailto:Tyler@KitsuneBeerCo.com">Tyler@KitsuneBeerCo.com</a>{" "}
              for bulk inquiries or specific card requests.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
