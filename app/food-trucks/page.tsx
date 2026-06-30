import type { Metadata } from "next";
import Link from "next/link";
import PageSection from "@/components/PageSection";
import FoodTruckCard from "@/components/mtg/FoodTruckCard";
import CTASection from "@/components/ui/CTASection";
import {
  foodTrucks,
  getTodaysTruck,
  getTodaysTruckEntry,
  getUpcomingTrucks,
  getWeeklySchedule,
  formatScheduleDate,
} from "@/lib/food-trucks-data";
import styles from "./food-trucks.module.css";

export const metadata: Metadata = {
  title: "Food Trucks",
  description:
    "See today's food truck and the upcoming schedule at Kitsune Brewing Co. in Phoenix, AZ.",
};

export default function FoodTrucksPage() {
  const today = getTodaysTruck();
  const todayEntry = today ? getTodaysTruckEntry(today) : null;
  const upcoming = getUpcomingTrucks(21);
  const weeklySchedule = getWeeklySchedule();

  return (
    <>
      <div className="page-banner">
        <h1>Food Trucks</h1>
      </div>

      {/* Today's Truck */}
      <PageSection background="white">
        <h2 className={styles.sectionHeading}>Tonight&apos;s Truck</h2>
        {today && todayEntry ? (
          <FoodTruckCard truck={today} entry={todayEntry} variant="featured" />
        ) : (
          <div className={styles.noTruck}>
            <p>No food truck scheduled for today.</p>
            <p>Check the upcoming schedule below or follow us on Instagram for the latest updates.</p>
          </div>
        )}
      </PageSection>

      {/* Weekly Schedule */}
      <PageSection background="light">
        <h2 className={styles.sectionHeading}>This Week</h2>
        <div className={styles.weekGrid}>
          {weeklySchedule.map(({ date, trucks }) => {
            const dateObj = new Date(date + "T00:00:00");
            const isToday = date === new Date().toISOString().split("T")[0];
            return (
              <div key={date} className={`${styles.weekDay} ${isToday ? styles.weekDayToday : ""}`}>
                <div className={styles.weekDayHeader}>
                  <span className={styles.weekDayName}>
                    {dateObj.toLocaleDateString("en-US", { weekday: "long" })}
                  </span>
                  <span className={styles.weekDayDate}>
                    {dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                  {isToday && <span className={styles.todayBadge}>Today</span>}
                </div>
                {trucks.length > 0 ? (
                  <div className={styles.weekDayTrucks}>
                    {trucks.map(({ truck, entry }) => (
                      <FoodTruckCard key={truck.id} truck={truck} entry={entry} variant="list" />
                    ))}
                  </div>
                ) : (
                  <p className={styles.noTruckDay}>No truck scheduled</p>
                )}
              </div>
            );
          })}
        </div>
      </PageSection>

      {/* Upcoming Trucks */}
      {upcoming.length > 0 && (
        <PageSection background="white">
          <h2 className={styles.sectionHeading}>Upcoming Trucks</h2>
          <div className={styles.upcomingGrid}>
            {upcoming.slice(0, 9).map(({ truck, entry }) => (
              <FoodTruckCard key={`${truck.id}-${entry.date}`} truck={truck} entry={entry} variant="card" />
            ))}
          </div>
        </PageSection>
      )}

      {/* All Trucks Directory */}
      <PageSection background="light">
        <h2 className={styles.sectionHeading}>Our Food Truck Partners</h2>
        <p className={styles.sectionSubtext}>
          We rotate through these amazing local trucks. Follow their Instagram pages for menus and special offers.
        </p>
        <div className={styles.directoryGrid}>
          {foodTrucks.map((truck) => (
            <div key={truck.id} className={styles.directoryCard}>
              <div className={styles.directoryTop}>
                <span className={styles.directoryName}>{truck.name}</span>
                <span className={styles.directoryCuisine}>{truck.cuisine}</span>
              </div>
              <p className={styles.directoryDesc}>{truck.description}</p>
              <div className={styles.directoryLinks}>
                {truck.instagram && (
                  <a href={truck.instagram} target="_blank" rel="noopener noreferrer" className={styles.directoryLink}>
                    Instagram ↗
                  </a>
                )}
                {truck.website && (
                  <a href={truck.website} target="_blank" rel="noopener noreferrer" className={styles.directoryLink}>
                    Website ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </PageSection>

      <CTASection
        headline="Want Your Truck at Kitsune?"
        subtext="We're always looking for great local food trucks. Reach out to book your spot."
        primaryLabel="Contact Us"
        primaryHref="/contact"
      />
    </>
  );
}
