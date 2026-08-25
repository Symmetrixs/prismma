export const STATUS_META: Record<string, { label: string; className: string }> = {
  in_use: { label: "In Use", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  in_storage: { label: "In Storage", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  under_repair: { label: "Under Repair", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  disposed: { label: "Disposed", className: "bg-surface-alt text-muted" },
  to_be_announced: { label: "To Be Announced", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

export const STATUS_OPTIONS = [
  { value: "in_use", label: "In Use" },
  { value: "in_storage", label: "In Storage" },
  { value: "under_repair", label: "Under Repair" },
  { value: "disposed", label: "Disposed" },
  { value: "to_be_announced", label: "To Be Announced" },
];

export const DIRECT_STATUS_OPTIONS = STATUS_OPTIONS.filter((s) => s.value !== "in_use");
