"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import styles from "../../app/admin/media/media.module.css";

interface ImageFile {
  filename: string;
  url: string;
  size: number;
  mtime: number;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibrary() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ImageFile | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [previewImg, setPreviewImg] = useState<ImageFile | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/upload");
    setImages(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function uploadFiles(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    setUploadProgress(`Uploading ${files.length} file${files.length > 1 ? "s" : ""}…`);
    const fd = new FormData();
    files.forEach((f) => fd.append("file", f));
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadProgress(null);
    setUploading(false);
    if (data.errors?.length) {
      alert(`${data.errors.length} file(s) failed:\n${data.errors.map((e: { filename: string; error: string }) => `${e.filename}: ${e.error}`).join("\n")}`);
    }
    await load();
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    uploadFiles(files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    uploadFiles(files);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    await fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: deleteTarget.filename }),
    });
    setDeleteTarget(null);
    setDeleting(false);
    await load();
  }

  async function copyUrl(url: string) {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = images.filter((img) =>
    !search || img.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Header row */}
      <div className={styles.libraryHeader}>
        <p style={{ fontSize: 13, color: "var(--color-text-light)" }}>
          {images.length} image{images.length !== 1 ? "s" : ""} · PNG, JPG, WebP, GIF, SVG supported
        </p>
        <button className="btn btn-primary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? uploadProgress : "↑ Upload Images"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={handleFileInput}
        />
      </div>

      {/* Drop zone */}
      <div
        ref={dropRef}
        className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <span className={styles.dropIcon}>⇪</span>
        <span className={styles.dropText}>
          {dragging ? "Drop to upload" : "Drag & drop images here, or click to browse"}
        </span>
        <span className={styles.dropHint}>max 20 MB each</span>
      </div>

      {/* Search */}
      {images.length > 0 && (
        <input
          className={styles.search}
          placeholder="Search images…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginTop: 12 }}
        />
      )}

      {/* Grid */}
      {loading ? (
        <p className={styles.empty}>Loading…</p>
      ) : filtered.length === 0 ? (
        <p className={styles.empty}>{images.length === 0 ? "No images uploaded yet." : "No images match your search."}</p>
      ) : (
        <div className={styles.grid} style={{ marginTop: 12 }}>
          {filtered.map((img) => (
            <div key={img.filename} className={styles.card}>
              <div className={styles.thumbWrap} onClick={() => setPreviewImg(img)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.filename} className={styles.thumb} loading="lazy" />
              </div>
              <div className={styles.cardBody}>
                <p className={styles.filename} title={img.filename}>{img.filename}</p>
                <p className={styles.meta}>{formatBytes(img.size)}</p>
              </div>
              <div className={styles.actions}>
                <button
                  className={`${styles.actionBtn} ${copied === img.url ? styles.actionBtnCopied : ""}`}
                  onClick={() => copyUrl(img.url)}
                  title="Copy URL"
                >
                  {copied === img.url ? "✓ Copied" : "Copy URL"}
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                  onClick={() => setDeleteTarget(img)}
                  title="Delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className={styles.overlay} onClick={() => !deleting && setDeleteTarget(null)}>
          <div className={styles.confirmBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Delete Image?</h3>
            <p className={styles.confirmText}>
              <strong>{deleteTarget.filename}</strong> will be permanently removed from the server.
              Any pages using this image will break.
            </p>
            <div className={styles.confirmBtns}>
              <button className="btn btn-outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</button>
              <button className={`btn btn-primary ${styles.dangerBtn}`} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview lightbox */}
      {previewImg && (
        <div className={styles.overlay} onClick={() => setPreviewImg(null)}>
          <div className={styles.lightbox} onClick={(e) => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setPreviewImg(null)}>✕</button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImg.url} alt={previewImg.filename} className={styles.lightboxImg} />
            <div className={styles.lightboxMeta}>
              <span className={styles.lightboxFilename}>{previewImg.filename}</span>
              <span className={styles.lightboxSize}>{formatBytes(previewImg.size)}</span>
              <button
                className={`${styles.actionBtn} ${copied === previewImg.url ? styles.actionBtnCopied : ""}`}
                onClick={() => copyUrl(previewImg.url)}
              >
                {copied === previewImg.url ? "✓ Copied" : "Copy URL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
