import styles from "./PageSection.module.css";

type Props = {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: "white" | "light" | "black";
  centered?: boolean;
  noBottomPadding?: boolean;
};

export default function PageSection({
  children,
  className = "",
  id,
  background = "white",
  centered = false,
  noBottomPadding = false,
}: Props) {
  const bgMap = {
    white: "var(--color-white)",
    light: "var(--color-bg)",
    black: "var(--color-black)",
  };

  return (
    <section
      id={id}
      className={`${styles.pageSection}${noBottomPadding ? ` ${styles.noBottomPadding}` : ""}${className ? ` ${className}` : ""}`}
      style={{ backgroundColor: bgMap[background] }}
    >
      <div className={`container${centered ? ` ${styles.textCentered}` : ""}`}>
        {children}
      </div>
    </section>
  );
}
