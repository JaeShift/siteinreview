import type { SVGProps } from "react";

/** Preserve the original lettering and wear, gently smoothing its enlarged silhouette. */
export default function HeroWordmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 582 229" width="582" height="229" aria-hidden="true" focusable="false" {...props}>
      <defs>
        <filter id="hero-wordmark-edge" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceAlpha" stdDeviation=".45" />
          <feComponentTransfer>
            <feFuncA type="linear" slope="2" intercept="-.5" />
          </feComponentTransfer>
        </filter>
        <mask id="hero-wordmark-letters" maskUnits="userSpaceOnUse" x="0" y="0" width="582" height="229" style={{ maskType: "alpha" }}>
          <image href="/images/home/kitsune-wordmark-textured.png" width="582" height="229" filter="url(#hero-wordmark-edge)" />
        </mask>
        <filter id="hero-wordmark-spots" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius="1" result="letter-interior" />
          <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 .28  0 0 0 0 .22  0 0 0 0 .12  -.65 -.65 -.65 0 1.75" />
          <feComposite in2="letter-interior" operator="in" />
        </filter>
      </defs>
      <g mask="url(#hero-wordmark-letters)">
        <path fill="currentColor" d="M0 0H582V229H0Z" />
        <image href="/images/home/kitsune-wordmark-textured.png" width="582" height="229" filter="url(#hero-wordmark-spots)" />
      </g>
    </svg>
  );
}
