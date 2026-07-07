"use client";

import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export default function Modal({ isOpen, onClose, title, children, size = "md" }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) dialog.showModal();
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };

    dialog.addEventListener("cancel", handleCancel);
    return () => dialog.removeEventListener("cancel", handleCancel);
  }, [onClose]);

  const mouseDownTarget = useRef<EventTarget | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDialogElement>) => {
    mouseDownTarget.current = e.target;
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current && mouseDownTarget.current === dialogRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.modal} ${styles[size]}`}
      onMouseDown={handleMouseDown}
      onClick={handleBackdropClick}
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div className={styles.content}>
        {title && (
          <div className={styles.header}>
            <h2 id="modal-title" className={styles.title}>{title}</h2>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        )}
        {!title && (
          <button className={`${styles.closeBtn} ${styles.closeBtnFloating}`} onClick={onClose} aria-label="Close modal">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
}
