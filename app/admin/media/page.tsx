import MediaLibrary from "@/components/admin/MediaLibrary";
import styles from "./media.module.css";

export default function MediaPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Media Library</h1>
        </div>
      </div>
      <MediaLibrary />
    </div>
  );
}
