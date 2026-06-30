import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

// Fonts are loaded by the Adobe Fonts kit in the <head> below.
// futura-pt → headings   |   proxima-nova → body / nav / forms / footer

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.kitsunebrewingco.com"
  ),
  title: {
    default: "Kitsune Brewing Co. — Phoenix, AZ",
    template: "%s | Kitsune Brewing Co.",
  },
  description:
    "Kitsune Brewing Co. is a craft brewery and taproom in Phoenix, AZ. Enjoy our rotating taps, events, MTG nights, and more.",
  keywords: ["Kitsune Brewing", "Phoenix brewery", "craft beer", "taproom", "Phoenix AZ"],
  openGraph: {
    siteName: "Kitsune Brewing Co.",
    locale: "en_US",
    type: "website",
    images: [{ url: "/images/logo.png", width: 400, height: 400, alt: "Kitsune Brewing Co." }],
  },
  icons: {
    icon: "/images/favicon.ico",
    shortcut: "/images/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://use.typekit.net" crossOrigin="" />
        <link rel="preconnect" href="https://p.typekit.net" crossOrigin="" />
        {/* Adobe Fonts kit — loads futura-pt + proxima-nova */}
        <link rel="stylesheet" href="https://use.typekit.net/nkn8ouk.css" />
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
