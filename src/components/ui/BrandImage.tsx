import Image from "next/image";
import type { ImageSlot } from "@/config/images";

/**
 * Brand image with a calm gradient fallback when no file is supplied.
 * When slot.src is empty, renders a brand-colour gradient (no invented photo).
 */
export function BrandImage({
  slot,
  className = "",
  fill = false,
  priority = false,
}: {
  slot: ImageSlot;
  className?: string;
  fill?: boolean;
  priority?: boolean;
}) {
  if (!slot.src) {
    // Gradient fallback: sage mist → warm cream (light, on-brand)
    return (
      <div
        role="img"
        aria-label={slot.alt}
        className={`bg-gradient-to-br from-sage-mist via-warm-cream to-sage-mist ${className}`}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={slot.src}
        alt={slot.alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <Image
      src={slot.src}
      alt={slot.alt}
      width={800}
      height={600}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}