import Image from "next/image";
import Link from "next/link";

import { TrustBadge, type TrustVariant } from "@/components/ui/TrustBadge";

export type RetreatCardProps = {
  id: string | number;
  title: string;
  type: string;
  location: string;
  dates: string;
  price: string;
  image: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  /** Trust badge variant derived from `trust_tier` (SCOPE-044). */
  trustVariant?: TrustVariant | null;
  href?: string;
};

export function RetreatCard({
  title,
  type,
  location,
  dates,
  price,
  image,
  rating,
  reviewCount,
  badge,
  trustVariant,
  href = "#",
}: RetreatCardProps) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-[1rem] bg-white shadow-[0_4px_12px_rgba(61,95,61,0.06)] transition-shadow duration-200 hover:shadow-[0_8px_24px_rgba(61,95,61,0.1)]"
    >
      <div className="relative isolate aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="z-0 object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div
          className="pointer-events-none absolute inset-0 z-[1] bg-linear-to-t from-black/60 via-transparent to-transparent"
          aria-hidden
        />
        {badge ? (
          <span className="absolute left-3 top-3 z-[2] max-w-[calc(100%-1.5rem)] truncate rounded-full bg-warm-brown/90 px-2.5 py-1 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur-sm">
            {badge}
          </span>
        ) : null}
        <div className="absolute inset-x-3 bottom-3 z-[2]">
          <span className="line-clamp-2 block font-semibold text-balance text-white drop-shadow-md">
            {title}
          </span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-xs font-semibold uppercase tracking-wider text-stone-500">
              {type}
            </span>
            {trustVariant ? <TrustBadge variant={trustVariant} /> : null}
          </span>
          {rating > 0 && (
            <span className="flex items-center gap-1 text-sm font-medium text-stone-800">
              <svg
                className="h-4 w-4 fill-amber-400"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {rating.toFixed(1)}
              {reviewCount !== undefined && (
                <span className="font-normal text-stone-500">
                  ({reviewCount})
                </span>
              )}
            </span>
          )}
        </div>
        <h3 className="sr-only">{title}</h3>
        <p className="mt-1 text-sm text-stone-500">{location}</p>
        <p className="mt-0.5 text-sm text-stone-500">{dates}</p>
        <p className="mt-2 text-sm font-semibold text-stone-900">
          {price}
        </p>
      </div>
    </Link>
  );
}
