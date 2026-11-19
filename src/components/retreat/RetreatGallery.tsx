"use client";
import { useRef, useState } from "react";
export function RetreatGallery({
  paths,
  title,
  illustrative = false,
}: {
  paths: string[];
  title: string;
  illustrative?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  if (!paths.length) return null;
  return (
    <>
      <div
        className={`lp-real-gallery count-${Math.min(paths.length, 4)} ${paths.length === 1 ? "single" : ""}`}
      >
        {paths.slice(0, 4).map((src, i) => (
          <button
            type="button"
            key={`${src}-${i}`}
            onClick={() => {
              setIndex(i);
              dialog.current?.showModal();
            }}
            aria-label={`Open ${illustrative ? "illustrative stock" : "retreat"} photo ${i + 1}`}
          >
            <img
              src={src}
              alt={illustrative ? `Illustrative destination stock photo, not the venue: ${title}` : `${title}, photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </button>
        ))}
        {illustrative && <span className="lp-stock-label">Illustrative stock · not the retreat venue</span>}
        {paths.length > 1 && (
          <button
            className="lp-gallery-open"
            onClick={() => dialog.current?.showModal()}
          >
            View all {paths.length} photos
          </button>
        )}
      </div>
      <dialog
        ref={dialog}
        className="lp-gallery-dialog"
        aria-label="Retreat photos"
      >
        <button
          className="lp-gallery-close"
          onClick={() => dialog.current?.close()}
          aria-label="Close photos"
        >
          ×
        </button>
        <img src={paths[index]} alt={illustrative ? `Illustrative destination stock, not the venue: ${title}` : `${title}, photo ${index + 1}`} />
        {illustrative && <p className="lp-stock-dialog-note">Illustrative stock photo. Does not show the retreat venue.</p>}
        <div className="lp-gallery-controls">
          <button
            disabled={paths.length === 1}
            onClick={() => setIndex((index - 1 + paths.length) % paths.length)}
          >
            ← Previous
          </button>
          <span>
            {index + 1} / {paths.length}
          </span>
          <button
            disabled={paths.length === 1}
            onClick={() => setIndex((index + 1) % paths.length)}
          >
            Next →
          </button>
        </div>
      </dialog>
    </>
  );
}
