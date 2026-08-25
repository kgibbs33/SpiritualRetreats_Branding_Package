import { notFound } from "next/navigation";

/** Internal target for middleware rewrite when legal pages are hidden. */
export default function LegalPagesDisabledPage() {
  notFound();
}
