import type { HTMLAttributes } from "react";
import Image from "next/image";

/** Use the original artwork to preserve its exact lettering and paper texture. */
export default function HeroWordmark(props: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props}>
      <Image
        src="/images/home/kitsune-wordmark-textured.png"
        alt="Kitsune"
        width={582}
        height={229}
        priority
        unoptimized
      />
    </span>
  );
}
