import type { ReactNode, SelectHTMLAttributes } from "react";

function SelectChevron() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-warm-brown"
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

const selectClass =
  "h-12 w-full min-w-0 appearance-none rounded-xl border border-beige bg-white py-0 pl-4 pr-11 text-sm font-medium leading-normal text-stone-900 focus:border-forest focus:outline-none focus:ring-2 focus:ring-teal disabled:cursor-not-allowed disabled:bg-beige/30 disabled:opacity-50";

type StyledSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  wrapperClassName?: string;
  children: ReactNode;
};

/** Native select with consistent text alignment and custom chevron (cross-browser). */
export function StyledSelect({
  wrapperClassName,
  className,
  children,
  ...props
}: StyledSelectProps) {
  return (
    <div className={`relative min-w-0 ${wrapperClassName ?? ""}`}>
      <select {...props} className={[selectClass, className].filter(Boolean).join(" ")}>
        {children}
      </select>
      <SelectChevron />
    </div>
  );
}
