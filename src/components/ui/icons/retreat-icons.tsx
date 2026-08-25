/**
 * Brand-aligned SVG icons for retreat discovery tiles.
 * All icons: 24×24 viewBox, stroke-based, strokeWidth 1.5,
 * strokeLinecap/Join round, fill="none" unless noted.
 * Uses currentColor so colour is controlled by the parent's text-* class.
 */

type IconProps = { className?: string };

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// ── Intention ──────────────────────────────────────────────────────────────

export function IconMoon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
    </svg>
  );
}

export function IconLeaf({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M17 8C8 10 5.9 16.17 3.82 19.11" />
      <path d="M21 3C16.27 6.47 6 8.5 3 22" />
      <path d="M21 3s-1 9-6 12" />
    </svg>
  );
}

export function IconSprout({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 22V12" />
      <path d="M12 12C12 7 16 4 20 4c0 4-2.5 8-8 8z" />
      <path d="M12 12C12 7 8 4 4 4c0 4 2.5 8 8 8z" />
    </svg>
  );
}

export function IconCrystal({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <polygon points="12 2 19 9 12 22 5 9" />
      <line x1="5" y1="9" x2="19" y2="9" />
    </svg>
  );
}

export function IconBolt({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function IconHandshake({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M16 11l-5 5" />
      <path d="M8 13l4-4 1.5 1.5" />
      <path d="M3 13l4 4 9-9-3-3-9 8z" />
      <path d="M15 5l3 3-1 1" />
      <path d="M19 7l2 2-9 9-4-4" />
    </svg>
  );
}

export function IconCompass({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

export function IconSparkles({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" />
      <path d="M5 18l.5 1.5L7 20l-1.5.5L5 22l-.5-1.5L3 20l1.5-.5L5 18z" />
    </svg>
  );
}

// ── Shift type ─────────────────────────────────────────────────────────────

export function IconWaves({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2 12c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0" />
      <path d="M2 17c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0" />
      <path d="M2 7c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 5 0" />
    </svg>
  );
}

export function IconHeart({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconButterfly({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 12C9 9 4 8 3 5c-1-3 2-4 4-3 2 1 4 4 5 10z" />
      <path d="M12 12c3-3 8-4 9-7 1-3-2-4-4-3-2 1-4 4-5 10z" />
      <path d="M12 12C9 15 8 20 5 21c-3 1-4-2-3-4 1-2 4-4 10-5z" />
      <path d="M12 12c3 3 4 8 7 9 3 1 4-2 3-4-1-2-4-4-10-5z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconScales({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <path d="M5 21h14" />
      <path d="M5 6l7-3 7 3" />
      <path d="M3 9l4 8H3z" />
      <path d="M21 9l-4 8h4z" />
    </svg>
  );
}

// ── Group / private ────────────────────────────────────────────────────────

export function IconGroup({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="7" r="3" />
      <path d="M3 21v-2a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v2" />
      <circle cx="17" cy="8" r="2" />
      <path d="M23 21v-1.5a3.5 3.5 0 0 0-3-3.47" />
    </svg>
  );
}

export function IconPerson({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 8-8 8 8 0 0 1 8 8v2" />
    </svg>
  );
}

export function IconCouple({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="7" r="3.5" />
      <circle cx="16" cy="7" r="3.5" />
      <path d="M2 21v-1.5a6.5 6.5 0 0 1 6.5-6.5h7A6.5 6.5 0 0 1 22 19.5V21" />
    </svg>
  );
}

export function IconCircleHalf({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18" />
      <path d="M12 7a5 5 0 0 1 0 10" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ── Location ───────────────────────────────────────────────────────────────

export function IconMountains({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <polyline points="3 20 9 9 14 15 17 11 21 20" />
      <line x1="3" y1="20" x2="21" y2="20" />
    </svg>
  );
}

export function IconOcean({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2 6C4 4 8 4 10 6s4 2 6 0 4-2 6 0" />
      <path d="M2 12c2-2 6-2 8 0s4 2 6 0 4-2 6 0" />
      <path d="M2 18c2-2 6-2 8 0s4 2 6 0 4-2 6 0" />
    </svg>
  );
}

export function IconJungle({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 22v-8" />
      <path d="M12 14C9 11 5 11 3 13c3 0 6 2 9 1z" />
      <path d="M12 14c3-3 7-3 9-1-3 0-6 2-9 1z" />
      <path d="M12 10C9 7 5 7 3 9c3 0 6 2 9 1z" />
      <path d="M12 10c3-3 7-3 9-1-3 0-6 2-9 1z" />
      <path d="M12 6C10 4 7 5 6 7c2 0 4 1 6-1z" />
      <path d="M12 6c2-2 5-1 6 1-2 0-4 1-6-1z" />
    </svg>
  );
}

export function IconCactus({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="12" y1="22" x2="12" y2="4" />
      <path d="M12 8c0-2-2-4-4-4v4" />
      <path d="M12 13c0-2 2-4 4-4v4" />
      <path d="M8 8v3" />
      <path d="M16 13v3" />
    </svg>
  );
}

export function IconTemple({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 20V10" />
      <path d="M20 20V10" />
      <path d="M2 10h20" />
      <path d="M12 4L2 10h20L12 4z" />
      <rect x="8" y="14" width="8" height="6" />
    </svg>
  );
}

export function IconHills({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 20c2-4 5-6 8-6s6 2 8 6" />
      <path d="M8 20c1-3 3-5 6-5" />
      <path d="M2 20h20" />
    </svg>
  );
}

export function IconMap({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

// ── Duration ───────────────────────────────────────────────────────────────

export function IconSunrise({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2v4M4.93 4.93l2.83 2.83M2 12h4M20 12h-4M19.07 4.93l-2.83 2.83" />
      <path d="M5 17a7 7 0 0 1 14 0" />
      <line x1="3" y1="21" x2="21" y2="21" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function IconMoonStar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M17.5 12A5.5 5.5 0 0 1 12 17.5 5.5 5.5 0 0 1 6.5 12 5.5 5.5 0 0 1 17.5 12z" />
      <path d="M17.5 12a5.5 5.5 0 0 0-5.5-5.5" />
      <path d="M18 3l.5 1.5L20 5l-1.5.5L18 7l-.5-1.5L16 5l1.5-.5L18 3z" />
    </svg>
  );
}

export function IconInfinity({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 12c-1.5-2-3-3-5-3a4 4 0 0 0 0 8c2 0 3.5-1 5-3 1.5 2 3 3 5 3a4 4 0 0 0 0-8c-2 0-3.5 1-5 3z" />
    </svg>
  );
}

// ── Practices ──────────────────────────────────────────────────────────────

export function IconLotus({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 22c0-5-3-9-3-9s3-1 3-5c0 4 3 5 3 5s-3 4-3 9z" />
      <path d="M12 13c-3-3-7-3-9-1 2 1 5 3 9 1z" />
      <path d="M12 13c3-3 7-3 9-1-2 1-5 3-9 1z" />
      <path d="M12 10c-2-3-5-4-7-3 1 2 3 4 7 3z" />
      <path d="M12 10c2-3 5-4 7-3-1 2-3 4-7 3z" />
    </svg>
  );
}

export function IconBreath({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 8a4 4 0 0 1 4 4" />
      <path d="M12 8a4 4 0 0 0-4 4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      <path d="M12 4C9 4 6 7 6 12" />
      <path d="M12 4c3 0 6 3 6 8" />
      <path d="M6 12c0 5 3 8 6 8" />
      <path d="M18 12c0 5-3 8-6 8" />
    </svg>
  );
}

export function IconBody({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v7" />
      <path d="M8 10l4-1 4 1" />
      <path d="M10 21l2-7 2 7" />
      <path d="M9 17h6" />
    </svg>
  );
}

export function IconSoundWave({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <line x1="12" y1="4" x2="12" y2="20" />
      <line x1="8" y1="7" x2="8" y2="17" />
      <line x1="4" y1="10" x2="4" y2="14" />
      <line x1="16" y1="7" x2="16" y2="17" />
      <line x1="20" y1="10" x2="20" y2="14" />
    </svg>
  );
}

export function IconTree({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 22v-6" />
      <path d="M12 16l-5-6h10l-5 6z" />
      <path d="M9 10l-4-5h14l-4 5" />
    </svg>
  );
}

export function IconBrush({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 21c4 0 6-2 6-6 0-3-1-5-4-5-3 0-5 2-5 5 0 2 1 3 3 3z" />
      <path d="M5 16L20 4" />
      <path d="M18 3l3 3-3-3z" />
    </svg>
  );
}

export function IconDrop({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2L8 8a6 6 0 1 0 8 0L12 2z" />
    </svg>
  );
}

export function IconChart({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}

export function IconHerb({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 22v-6" />
      <path d="M12 16c0-4-3-7-7-7 0 4 3 7 7 7z" />
      <path d="M12 16c0-4 3-7 7-7 0 4-3 7-7 7z" />
      <path d="M12 10c0-3-2-5-4-6 0 3 1 5 4 6z" />
      <path d="M12 10c0-3 2-5 4-6 0 3-1 5-4 6z" />
    </svg>
  );
}

// ── Budget ─────────────────────────────────────────────────────────────────

export function IconCircle({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

export function IconGem({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2l4 6H8l4-6z" />
      <path d="M8 8l4 13 4-13H8z" />
      <line x1="3" y1="8" x2="8" y2="8" />
      <line x1="21" y1="8" x2="16" y2="8" />
      <path d="M3 8l9 13" />
      <path d="M21 8L12 21" />
      <path d="M3 8l5-6" />
      <path d="M21 8l-5-6" />
    </svg>
  );
}

export function IconDiamond({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.7 10.3L12 21l9.3-10.7" />
      <path d="M6.3 3h11.4l4 7.3H2.3L6.3 3z" />
    </svg>
  );
}

export function IconCrown({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M3 18l3-10 6 5 6-5 3 10H3z" />
      <line x1="3" y1="22" x2="21" y2="22" />
    </svg>
  );
}

export function IconSpiral({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 12c0-1.5-1-2.5-2.5-2.5S7 10.5 7 12s1 2.5 2.5 2.5 4-1.5 4-4-2-5-5-5-7 3-7 7 3 7 7 7 9-4 9-9" />
    </svg>
  );
}

// ── Capacity ───────────────────────────────────────────────────────────────

export function IconUsers({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="6" cy="7" r="2.5" />
      <circle cx="12" cy="7" r="2.5" />
      <circle cx="18" cy="7" r="2.5" />
      <path d="M1 21v-1.5a4.5 4.5 0 0 1 4.5-4.5h1" />
      <path d="M23 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-1" />
      <path d="M8 21v-1.5A4.5 4.5 0 0 1 12.5 15h-1A4.5 4.5 0 0 0 7 19.5V21" />
      <path d="M12 15h.01" />
      <path d="M8.5 15h7A4.5 4.5 0 0 1 20 19.5V21H4v-1.5A4.5 4.5 0 0 1 8.5 15z" />
    </svg>
  );
}

export function IconSpa({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 22c0-5 4-8 4-12a4 4 0 0 0-8 0c0 4 4 7 4 12z" />
      <path d="M12 10c-2-3-5-4-8-2 1 3 4 5 8 4z" />
      <path d="M12 10c2-3 5-4 8-2-1 3-4 5-8 4z" />
    </svg>
  );
}

export function IconStar({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function IconPeople({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="6" r="2.5" />
      <circle cx="15" cy="6" r="2.5" />
      <circle cx="3" cy="8" r="2" />
      <circle cx="21" cy="8" r="2" />
      <path d="M5 20v-1a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v1" />
      <path d="M1 20v-.5A3.5 3.5 0 0 1 4.5 16" />
      <path d="M23 20v-.5A3.5 3.5 0 0 0 19.5 16" />
    </svg>
  );
}

// ── Navigation / UI ────────────────────────────────────────────────────────

export function IconYoga({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="4" r="2" />
      <path d="M12 6v4" />
      <path d="M7 10c0 2 2 3 5 3s5-1 5-3" />
      <path d="M8 10l-3 7" />
      <path d="M16 10l3 7" />
      <path d="M9 22l3-5 3 5" />
    </svg>
  );
}
