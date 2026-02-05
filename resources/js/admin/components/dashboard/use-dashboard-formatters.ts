import * as React from "react"

type DashboardFormatters = {
  currencyFormatter: Intl.NumberFormat;
  numberFormatter: Intl.NumberFormat;
  compactNumberFormatter: Intl.NumberFormat;
  formatDate: (value: string) => string;
};

export function useDashboardFormatters(
  locale: string,
  currency: string | null | undefined,
): DashboardFormatters {
  const uiLocale = locale === "ru" ? "ru-RU" : "en-US";

  const currencyFormatter = React.useMemo(
    () => new Intl.NumberFormat(uiLocale, {
      style: "currency",
      currency: currency ?? "BYN",
      maximumFractionDigits: 2,
    }),
    [currency, uiLocale]
  );

  const numberFormatter = React.useMemo(
    () => new Intl.NumberFormat(uiLocale),
    [uiLocale]
  );

  const compactNumberFormatter = React.useMemo(
    () => new Intl.NumberFormat(uiLocale, { notation: "compact", maximumFractionDigits: 1 }),
    [uiLocale]
  );

  const dateFormatter = React.useMemo(
    () => new Intl.DateTimeFormat(uiLocale, { month: "short", day: "numeric" }),
    [uiLocale]
  );

  const formatDate = React.useCallback(
    (value: string) => {
      const safeValue = value.includes("T") ? value : `${value}T00:00:00`;
      return dateFormatter.format(new Date(safeValue));
    },
    [dateFormatter]
  );

  return {
    currencyFormatter,
    numberFormatter,
    compactNumberFormatter,
    formatDate,
  };
}
