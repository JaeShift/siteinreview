import type { Metadata } from "next";
import PageSection from "@/components/PageSection";
import PromoTixEmbed from "@/components/PromoTixEmbed";
import styles from "./casino.module.css";

export const metadata: Metadata = {
  title: "Casino Night",
  description:
    "Join Kitsune Brewing Co. for a special Casino Night — classy fun, great music, casino games, and more. Tickets available while they last.",
};

export default function CasinoNightPage() {
  return (
    <>
      <div className="page-banner">
        <h1>🎲 Casino Night 🎲</h1>
      </div>

      <PageSection background="white">
        <div className={styles.casinoContent}>
          <div className={styles.casinoDescription}>
            <h2>A Night of Classy Fun</h2>
            <p>
              Join us for a night of classy fun, great music, casino games, and
              plenty of cheering, dancing, and excitement. Kitsune Brewing will
              be closing to the public for a special Casino Night experience
              brought to you by{" "}
              <strong>@edgeacademyandevents</strong>.
            </p>
            <p className={styles.disclaimer}>
              No money will be exchanged during gameplay. All casino games are
              for entertainment purposes only.
            </p>

            <div className={styles.ticketIncludes}>
              <h3>Your Ticket Includes:</h3>
              <ul>
                <li>Entry to the event</li>
                <li>Your first beer</li>
                <li>Access to all casino games and activities for the evening</li>
              </ul>
            </div>

            <div className={styles.prizes}>
              <h3>Prizes Awarded For:</h3>
              <ul>
                <li>♠️ Best Dressed</li>
                <li>♥️ Best Dance Moves</li>
                <li>♣️ And more surprises all evening long</li>
              </ul>
            </div>

            <p className={styles.dresscode}>
              Dress to impress and get ready for a fun night at Kitsune!
            </p>
            <p className={styles.entertainmentNotice}>
              <strong>* THIS EVENT IS FOR ENTERTAINMENT PURPOSES ONLY *</strong>
            </p>
          </div>

          <div className={styles.ticketCol}>
            <h2>Purchase Tickets</h2>
            <PromoTixEmbed />
          </div>
        </div>
      </PageSection>
    </>
  );
}
