"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Round team headshot with monogram fallback.
 * If imagePath is missing or the file fails to load, renders initials
 * in a brand navy/gold monogram circle — never a broken image icon.
 */
export function TeamHeadshot({ name, imagePath }: { name: string; imagePath?: string }) {
  const [failed, setFailed] = useState(false);
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join("") || "?";

  if (!imagePath || failed) {
    return (
      <div
        className="flex h-32 w-32 items-center justify-center rounded-full bg-celestial-navy text-2xl font-semibold text-sacred-gold"
        role="img"
        aria-label={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <Image
      src={imagePath}
      alt={name}
      width={128}
      height={128}
      onError={() => setFailed(true)}
      className="h-32 w-32 rounded-full object-cover object-top"
    />
  );
}