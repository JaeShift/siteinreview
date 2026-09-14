import PageHero from "@/components/ui/PageHero";
import styles from "./EventBanner.module.css";

interface Props {
  imageUrl: string;
  title: string;
  subtitle?: string;
  height?: "sm" | "md" | "lg";
}

export default function EventBanner({ imageUrl, title, subtitle, height = "md" }: Props) {
  return (
    <PageHero
      variant="image"
      image={imageUrl}
      imageAlt={title}
      kicker={subtitle}
      title={title}
      className={styles[height]}
    />
  );
}
