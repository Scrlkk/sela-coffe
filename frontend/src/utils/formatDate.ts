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
  return formatDate(dateStr, "en-GB");
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
