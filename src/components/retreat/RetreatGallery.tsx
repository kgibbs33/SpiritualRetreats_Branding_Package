"use client";
import { useRef, useState } from "react";
export function RetreatGallery({
  paths,
  title,
}: {
  paths: string[];
  title: string;
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
            aria-label={`Open retreat photo ${i + 1}`}
          >
            <img
              src={src}
              alt={`${title}, photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </button>
        ))}
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
        <img src={paths[index]} alt={`${title}, photo ${index + 1}`} />
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
