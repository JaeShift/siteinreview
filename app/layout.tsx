import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans, Fraunces, Manrope } from "next/font/google";
import SiteShell from "@/components/SiteShell";
import "@/styles/globals.css";
import "@/styles/public-brand.css";

const barlow = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-barlow", display: "swap", fallback: ["Impact", "Arial Narrow", "sans-serif"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm", display: "swap", fallback: ["Arial", "sans-serif"] });

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#171815",
};

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
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${barlow.variable} ${dmSans.variable}`}>
      <head>
        {/* Mana font — official MTG mana/set symbols */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/mana-font@latest/css/mana.css" />
      </head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
