import Image from "next/image";
import { EMBLEM_PATH, BRAND_NAME } from "@/lib/brand";

/**
 * Single logo component used by Header, Footer, mobile nav, emails.
 *
 * CURRENT STATE (interim): the final "LIGHT PATH RETREATS" lockup artwork is
 * not delivered yet — the emblem (no lettering) is the only safe file.
 *
 * When the owner drops the final lockup files into `public/brand/`, update
 * this one component and the whole site follows. Expected final files:
 *   - lpr-logo-horizontal-transparent.png
 *   - lpr-logo-primary.png
 *   - lpr-wordmark.png
 *   - lpr-emblem.png (already here)
 */

const DEFAULT_SIZE = 64; // px — 56–72 range per brand guide

type BrandLogoProps = {
  /** Width in px. Defaults to 64. */
  size?: number;
  /** Extra classes on the wrapper for spacing/styling. */
  className?: string;
};

export function BrandLogo({ size = DEFAULT_SIZE, className }: BrandLogoProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center ${className ?? ""}`}
      style={{ width: size, height: size }}
    >
      <Image
        src={EMBLEM_PATH}
        alt={BRAND_NAME}
        width={size}
        height={size}
        className="size-full object-contain"
        priority
      />
    </span>
  );
}