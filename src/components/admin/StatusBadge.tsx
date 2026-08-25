const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-red-50 text-red-600 border border-red-200",
  published: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  draft: "bg-gray-100 text-gray-600 border border-gray-200",
  recorded: "bg-blue-50 text-blue-700 border border-blue-200",
  notified: "bg-teal-50 text-teal-700 border border-teal-200",
  closed: "bg-gray-100 text-gray-600 border border-gray-200",
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600 border border-gray-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {status}
    </span>
  );
}
