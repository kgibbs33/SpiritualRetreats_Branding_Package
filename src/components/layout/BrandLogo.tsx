import Image from "next/image";
import { EMBLEM_PATH, BRAND_NAME } from "@/lib/brand";

/**
 * Single logo component — Header, Footer, mobile nav, emails.
 *
 * Variants:
 *   "emblem"    — the emblem only (square, transparent). For mobile nav,
 *                 footer, and any dark/coloured background. Default size 64px.
 *   "horizontal" — the full lockup (emblem + LIGHT PATH RETREATS + motto),
 *                 opaque white-background PNG. For desktop header only.
 *                 Place ONLY on white or very light backgrounds.
 *
 * File: public/brand/lpr-logo-horizontal.png  (1563×571, RGB, opaque)
 *
 * Never retype, recolour, stretch, rotate or crop the logo.
 * The motto stays attached to the lockup.
 */

const EMBLEM_SIZE = 64;
const HORIZONTAL_WIDTH = 280;
const HORIZONTAL_HEIGHT = 102; // 280 × (571/1563) ≈ 102

const HORIZONTAL_PATH = "/brand/lpr-logo-horizontal.png";

type BrandLogoProps = {
  /** Which logo asset to render. */
  variant?: "emblem" | "horizontal";
  /** Extra classes on the wrapper. */
  className?: string;
};

export function BrandLogo({
  variant = "emblem",
  className,
}: BrandLogoProps) {
  if (variant === "horizontal") {
    return (
      <span className={`inline-flex shrink-0 items-center ${className ?? ""}`}>
        <Image
          src={HORIZONTAL_PATH}
          alt={BRAND_NAME}
          width={1563}
          height={571}
          style={{ width: HORIZONTAL_WIDTH, height: "auto" }}
          className="block h-auto"
          priority
        />
      </span>
    );
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center ${className ?? ""}`}
      style={{ width: EMBLEM_SIZE, height: EMBLEM_SIZE }}
    >
      <Image
        src={EMBLEM_PATH}
        alt={BRAND_NAME}
        width={EMBLEM_SIZE}
        height={EMBLEM_SIZE}
        className="size-full object-contain"
        priority
      />
    </span>
  );
}