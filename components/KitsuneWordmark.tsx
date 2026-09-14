"use client";

import { useId, type SVGProps } from "react";

/** Render the generated lettering in the surrounding brand color. */
export default function KitsuneWordmark({ decorative = false, ...props }: SVGProps<SVGSVGElement> & { decorative?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="45 28 1970 700" role={decorative ? undefined : "img"} aria-label={decorative ? undefined : "Kitsune"} aria-hidden={decorative || undefined} focusable="false" {...props}>
      <defs>
        <filter id={`${id}-ink`} colorInterpolationFilters="sRGB">
          {/* Isolate black lettering from the generator's gray preview grid. */}
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -1 -1 -1 0 1" />
        </filter>
        <mask id={`${id}-letters`} maskUnits="userSpaceOnUse" x="0" y="0" width="2060" height="763" style={{ maskType: "alpha" }}>
          <image href="/images/home/kitsune-lettering.png" width="2060" height="763" filter={`url(#${id}-ink)`} />
        </mask>
      </defs>
      <rect width="2060" height="763" fill="currentColor" mask={`url(#${id}-letters)`} />
    </svg>
  );
}
