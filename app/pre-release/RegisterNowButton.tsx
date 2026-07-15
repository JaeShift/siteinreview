"use client";

import { useState } from "react";
import type { MtgEvent } from "@/lib/events-data";
import { isEventSoldOut } from "@/lib/events-data";
import RegistrationForm from "@/components/mtg/RegistrationForm";
import Modal from "@/components/ui/Modal";
import styles from "./prerelease.module.css";

interface Props {
  event: MtgEvent | null;
  fallbackHref: string;
}

export default function RegisterNowButton({ event, fallbackHref }: Props) {
  const [open, setOpen] = useState(false);

  // No upcoming event — fall back to events page
  if (!event) {
    return (
      <a href={fallbackHref} className={styles.registerBtn}>
        REGISTER NOW
      </a>
    );
  }

  const soldOut = isEventSoldOut(event);
  const registrationOpen = event.registrationOpen !== false;
  const disabled = soldOut || !registrationOpen;

  return (
    <>
      <button
        className={styles.registerBtn}
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        style={disabled ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
      >
        {soldOut ? "SOLD OUT" : !registrationOpen ? "REGISTRATION CLOSED" : "REGISTER NOW"}
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)}>
        <RegistrationForm event={event} onSuccess={() => setOpen(false)} />
      </Modal>
    </>
  );
}
