type Props = {
  className?: string;
  iconSize?: number;
  iconWidth?: number;
  iconHeight?: number;
};

export default function SocialLinks({ className = "", iconSize = 20, iconWidth, iconHeight }: Props) {
  const w = iconWidth ?? iconSize;
  const h = iconHeight ?? iconSize;
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <a
        href="http://instagram.com/kitsunebrewingco"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Kitsune Brewing on Instagram"
        className="social-link"
      >
        <InstagramIcon width={w} height={h} />
      </a>
      <a
        href="https://www.facebook.com/KitsuneBrewCo"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Kitsune Brewing on Facebook"
        className="social-link"
      >
        <FacebookIcon width={w - 2} height={h + 10} />
      </a>
    </div>
  );
}

function InstagramIcon({ width, height }: { width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ width, height }: { width: number; height: number }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}
