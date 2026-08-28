export const formatDate = (dateStr?: string, locale = "id-ID"): string => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return "-";
  }
};

export const formatDateTime = (
  dateStr?: string,
  locale = "id-ID",
): string => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
};

export const formatTime = (dateStr?: string, locale = "id-ID"): string => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "-";
  }
};

export const formatLastUpdated = (dateStr?: string): string => {
  return formatDate(dateStr, "id-ID");
};

export const formatSessionDateTime = (
  date: Date = new Date(),
): { dateStr: string; timeStr: string; fullStr: string } => {
  const timeStr = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const dateStr = date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return { dateStr, timeStr, fullStr: `${dateStr}, ${timeStr}` };
};

export type DateRangeFilter =
  | "ALL"
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH";

export const DATE_RANGE_OPTIONS = [
  { id: "ALL", label: "All Time" },
  { id: "TODAY", label: "Today" },
  { id: "LAST_7_DAYS", label: "Last 7 Days" },
  { id: "LAST_30_DAYS", label: "Last 30 Days" },
  { id: "THIS_MONTH", label: "This Month" },
];

export const isWithinDateRange = (
  dateInput: string | Date | undefined | null,
  range: DateRangeFilter,
): boolean => {
  if (!dateInput || range === "ALL") return true;

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return true;
  const now = new Date();

  if (range === "TODAY") {
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  if (range === "LAST_7_DAYS") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return date >= sevenDaysAgo;
  }

  if (range === "LAST_30_DAYS") {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return date >= thirtyDaysAgo;
  }

  if (range === "THIS_MONTH") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }

  return true;
};
