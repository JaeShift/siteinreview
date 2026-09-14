import styles from "./PageSection.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "light" | "black";
  surface?: "cream" | "paper" | "muted" | "ink" | "cedar";
  size?: "sm" | "md" | "lg";
  divider?: boolean;
  centered?: boolean;
  noBottomPadding?: boolean;
};

export default function PageSection({
  children,
  className = "",
  id,
  background = "white",
  surface,
  size = "md",
  divider = false,
  centered = false,
  noBottomPadding = false,
}: Props) {
  const legacySurface = {
    white: "paper",
    light: "cream",
    black: "ink",
  } as const;
  const surfaceClass = styles[surface ?? legacySurface[background]];
  const sizeClass = styles[size];
  const sectionClassName = [
    styles.pageSection,
    surfaceClass,
    sizeClass,
    divider ? styles.divider : "",
    noBottomPadding ? styles.noBottomPadding : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <section id={id} className={sectionClassName}>
      <div className={`container${centered ? ` ${styles.textCentered}` : ""}`}>
        {children}
      </div>
    </section>
  );
}
