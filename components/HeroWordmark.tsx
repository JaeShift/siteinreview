import type { HTMLAttributes } from "react";
import Image from "next/image";

/** Original lettering traced into curves so desktop scaling keeps sharp edges. */
export default function HeroWordmark(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props}>
      <Image
        src="/images/home/kitsune-wordmark-vector.svg"
        alt="Kitsune"
        width={582}
        height={229}
        priority
        unoptimized
      />
    </span>
  );
}
