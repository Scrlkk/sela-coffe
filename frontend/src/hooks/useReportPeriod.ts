import { useState, useCallback } from "react";
import { safeStorage } from "@/utils/storage";
import { type DateRangeFilter, REPORT_PERIOD_OPTIONS } from "@/services/report";

export const REPORT_PERIOD_STORAGE_KEY = "sela_report_period_filter";
export const DEFAULT_REPORT_PERIOD: DateRangeFilter = "all_time";

const VALID_PERIODS = new Set<string>(
  REPORT_PERIOD_OPTIONS.map((o) => o.value),
);

export function getStoredReportPeriod(
  storageKey: string = REPORT_PERIOD_STORAGE_KEY,
): DateRangeFilter {
  if (typeof window === "undefined") return DEFAULT_REPORT_PERIOD;
  const saved = safeStorage.getItem(storageKey);
  if (saved && VALID_PERIODS.has(saved)) {
    return saved as DateRangeFilter;
  }
  return DEFAULT_REPORT_PERIOD;
}

export function useReportPeriod(
  storageKey: string = REPORT_PERIOD_STORAGE_KEY,
) {
  const [period, setPeriodState] = useState<DateRangeFilter>(() =>
    getStoredReportPeriod(storageKey),
  );

  const setPeriod = useCallback(
    (newPeriod: DateRangeFilter) => {
      setPeriodState(newPeriod);
      safeStorage.setItem(storageKey, newPeriod);
    },
    [storageKey],
  );

  return {
    period,
    setPeriod,
  };
}

export default useReportPeriod;
