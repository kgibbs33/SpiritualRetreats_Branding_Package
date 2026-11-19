import Image from "next/image";
import Link from "next/link";
import type { RetreatCardProps } from "@/components/retreat/RetreatCard";
export function DirectoryCard({
  badge,
  title,
  type,
  location,
  dates,
  price,
  image,
  href = "/retreat-listings",
}: RetreatCardProps) {
  return (
    <article className="lp-card">
      <Link href={href} className="lp-card-image" aria-label={`View ${title}`}>
        {image ? (
          <Image
            src={image}
            alt={badge === "Milestone preview" ? `Illustrative destination stock photo, not the venue for ${title}` : title}
            fill
            sizes="(max-width: 600px) 100vw, 280px"
            className="object-cover"
          />
        ) : (
          <div className="lp-no-image">Photos pending</div>
        )}
        <span>{badge === "Milestone preview" ? "Illustrative stock · not the venue" : type}</span>
      </Link>
      <div className="lp-card-body">
        <p className="lp-eyebrow">{location}</p>
        <h3>
          <Link href={href}>{title}</Link>
        </h3>
        {dates && <p className="lp-card-dates">◷ {dates}</p>}
        <div className="lp-card-bottom">
          <div>
            <span className="lp-fine">Listed price</span>
            <p className="lp-card-price">{price || "Contact the team"}</p>
          </div>
          <Link className="lp-button lp-outline" href={href}>
            Explore retreat ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
