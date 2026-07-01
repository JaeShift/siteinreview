import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getProductBySlug, mtgProducts } from "@/lib/mtg-products";
import styles from "./product.module.css";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return mtgProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProductBySlug(params.slug);
  if (!product) return { title: "Not Found" };
  return {
    title: product.title,
    description: product.description,
  };
}

export default function PreReleaseProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  const isSoldOut = product.availability === "sold-out";
  const isComingSoon = product.availability === "coming-soon";

  return (
    <>
      <div className="page-banner">
        <h1>Pre-Release</h1>
      </div>

      <section className={styles.productSection}>
        <div className="container">
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/pre-release" className={styles.breadcrumbLink}>
              Pre-Release
            </Link>
            <span className={styles.breadcrumbSep}>›</span>
            <span className={styles.breadcrumbCurrent}>{product.title}</span>
          </nav>

          <div className={styles.productGrid}>
            <div className={styles.productImageCol}>
              <div className={styles.productImageWrap}>
                <Image
                  src={product.imageUrl}
                  alt={product.imageAlt}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>

            <div className={styles.productDetailsCol}>
              <h1 className={styles.productTitle}>{product.title}</h1>
              <p className={styles.productPrice}>{product.price}</p>
              <p className={styles.productDesc}>{product.description}</p>

              <div className={styles.productActions}>
                {isSoldOut ? (
                  <button className={`btn btn-outline ${styles.soldOut}`} disabled>
                    Sold Out
                  </button>
                ) : isComingSoon ? (
                  <button className={`btn btn-outline ${styles.soldOut}`} disabled>
                    Coming Soon
                  </button>
                ) : (
                  <div className={styles.addToCartRow}>
                    <div>
                      <label htmlFor="qty" className="form-label">
                        Quantity
                      </label>
                      <input
                        id="qty"
                        type="number"
                        min={1}
                        max={10}
                        defaultValue={1}
                        className={`form-input ${styles.qtyInput}`}
                      />
                    </div>
                    <button className={`btn btn-primary ${styles.addCartBtn}`}>
                      Add To Cart
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>
    </>
  );
}
