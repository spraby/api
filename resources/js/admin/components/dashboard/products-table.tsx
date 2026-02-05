import * as React from "react"

import { Link, router } from "@inertiajs/react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TopProduct, TopConversionPage, InterestGap } from "./types"

type TopSortKey = "views" | "add_to_cart" | "orders" | "revenue";
type GapSortKey = "view_to_cart" | "view_to_order" | "cart_to_order";

type ColumnDef<Row, Key extends string> = {
  key: Key;
  label: string;
  render: (row: Row) => React.ReactNode;
};

type DashboardProductsTableProps = {
  range: number;
  tableMode: "top" | "gap";
  onTableModeChange: (value: "top" | "gap") => void;
  topProducts: TopProduct[];
  topConversion: TopConversionPage;
  numberFormatter: Intl.NumberFormat;
  currencyFormatter: Intl.NumberFormat;
  t: (key: string) => string;
  trans: (key: string, replacements?: Record<string, string | number>) => string;
};

const TOP_PAGE_SIZE = 10;

function ProductCell({
  title,
  category,
  imageUrl,
  href,
  fallback,
}: {
  title: string;
  category: string | null;
  imageUrl?: string | null;
  href: string;
  fallback: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {imageUrl ? (
        <Link
          className="flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground"
          href={href}
        >
          <img
            src={imageUrl}
            alt={title}
            className="size-full object-cover"
            loading="lazy"
          />
        </Link>
      ) : (
        <div className="flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground">
          —
        </div>
      )}
      <div className="flex flex-col">
        <span className="font-medium">{title}</span>
        <span className="text-xs text-muted-foreground">
          {category ?? fallback}
        </span>
      </div>
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  activeKey,
  direction,
  onChange,
}: {
  label: string;
  sortKey: string;
  activeKey: string | null;
  direction: "asc" | "desc";
  onChange: (key: string) => void;
}) {
  const isActive = sortKey === activeKey;
  const Icon = !isActive
    ? ArrowUpDownIcon
    : direction === "asc"
      ? ArrowUpIcon
      : ArrowDownIcon;

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-8 w-full justify-end px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      onClick={() => onChange(sortKey)}
    >
      <span>{label}</span>
      <Icon className="ml-1 h-3 w-3" />
    </Button>
  );
}

const getConversionValue = (
  row: TopProduct | InterestGap,
  key: GapSortKey,
) => {
  const views = row.views ?? 0;
  const addToCart = row.add_to_cart ?? 0;
  const orders = row.orders ?? 0;

  if (key === "view_to_cart") {
    return views > 0 ? (addToCart / views) * 100 : 0;
  }
  if (key === "view_to_order") {
    return views > 0 ? (orders / views) * 100 : 0;
  }
  if (key === "cart_to_order") {
    return addToCart > 0 ? (orders / addToCart) * 100 : 0;
  }
  return 0;
};

const formatPercent = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }
  return `${value.toFixed(1)}%`;
};

export function DashboardProductsTable({
  range,
  tableMode,
  onTableModeChange,
  topProducts,
  topConversion,
  numberFormatter,
  currencyFormatter,
  t,
  trans,
}: DashboardProductsTableProps) {
  const [topSortKey, setTopSortKey] = React.useState<TopSortKey>("revenue");
  const [topSortDirection, setTopSortDirection] = React.useState<"asc" | "desc">("desc");
  const [topPage, setTopPage] = React.useState(1);
  const [isGapLoading, setIsGapLoading] = React.useState(false);
  const [cachedGapRows, setCachedGapRows] = React.useState<InterestGap[]>(topConversion.data ?? []);

  React.useEffect(() => {
    if (tableMode === "gap") {
      setCachedGapRows(topConversion.data ?? []);
      setIsGapLoading(false);
    }
  }, [tableMode, topConversion.data]);

  const sortedTopRows = React.useMemo(() => {
    return [...topProducts].sort((a, b) => {
      const aValue = Number((a as Record<string, unknown>)[topSortKey] ?? 0);
      const bValue = Number((b as Record<string, unknown>)[topSortKey] ?? 0);
      if (aValue === bValue) {
        return 0;
      }
      return topSortDirection === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [topProducts, topSortKey, topSortDirection]);

  const topTotalPages = Math.max(1, Math.ceil(sortedTopRows.length / TOP_PAGE_SIZE));
  const topCurrentPage = Math.min(topPage, topTotalPages);
  const topPagedRows = React.useMemo(() => {
    const start = (topCurrentPage - 1) * TOP_PAGE_SIZE;
    return sortedTopRows.slice(start, start + TOP_PAGE_SIZE);
  }, [sortedTopRows, topCurrentPage]);

  React.useEffect(() => {
    if (topPage > topTotalPages) {
      setTopPage(topTotalPages);
    }
  }, [topPage, topTotalPages]);

  const gapRows = topConversion.data ?? [];
  const gapPagination = topConversion.pagination;
  const gapTotalPages = Math.max(1, gapPagination.last_page);
  const gapCurrentPage = Math.min(gapPagination.page, gapTotalPages);
  const displayGapRows = tableMode === "gap" && isGapLoading && cachedGapRows.length > 0
    ? cachedGapRows
    : gapRows;

  const topColumns = React.useMemo<ColumnDef<TopProduct, TopSortKey>[]>(() => ([
    {
      key: "views",
      label: t("admin.dashboard.tables.headers.views"),
      render: (row) => numberFormatter.format(row.views),
    },
    {
      key: "add_to_cart",
      label: t("admin.dashboard.tables.headers.added_to_cart"),
      render: (row) => numberFormatter.format(row.add_to_cart ?? 0),
    },
    {
      key: "orders",
      label: t("admin.dashboard.tables.headers.ordered"),
      render: (row) => numberFormatter.format(row.orders),
    },
    {
      key: "revenue",
      label: t("admin.dashboard.tables.headers.revenue"),
      render: (row) => currencyFormatter.format(row.revenue ?? 0),
    },
  ]), [currencyFormatter, numberFormatter, t]);

  const gapColumns = React.useMemo<ColumnDef<InterestGap, GapSortKey>[]>(() => ([
    {
      key: "view_to_cart",
      label: t("admin.dashboard.tables.headers.view_to_cart"),
      render: (row) => formatPercent(getConversionValue(row, "view_to_cart")),
    },
    {
      key: "view_to_order",
      label: t("admin.dashboard.tables.headers.view_to_order"),
      render: (row) => formatPercent(getConversionValue(row, "view_to_order")),
    },
    {
      key: "cart_to_order",
      label: t("admin.dashboard.tables.headers.cart_to_order"),
      render: (row) => formatPercent(getConversionValue(row, "cart_to_order")),
    },
  ]), [t]);

  const handleTopSortChange = (key: TopSortKey) => {
    if (key === topSortKey) {
      setTopSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setTopSortKey(key);
      setTopSortDirection("desc");
    }
    setTopPage(1);
  };

  const handleTableModeChange = (value: string) => {
    if (!value || value === tableMode) {
      return;
    }

    if (value === "top") {
      setTopPage(1);
      setTopSortKey("revenue");
      setTopSortDirection("desc");
      onTableModeChange("top");
      router.get(
        route("admin.dashboard", { range, table: "top" }),
        {},
        {
          preserveState: true,
          preserveScroll: true,
          only: ["table_mode"],
        }
      );
      return;
    }

    setIsGapLoading(true);
    onTableModeChange("gap");
    router.get(
      route("admin.dashboard", {
        range,
        table: "gap",
        conv_sort: gapPagination.sort ?? "view_to_order",
        conv_dir: gapPagination.direction ?? "desc",
        conv_page: 1,
      }),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ["table_mode", "top_conversion"],
      }
    );
  };

  const handleGapSortChange = (key: GapSortKey) => {
    const currentDirection = gapPagination.direction;
    const nextDirection = key === gapPagination.sort
      ? (currentDirection === "asc" ? "desc" : "asc")
      : "desc";

    setIsGapLoading(true);
    router.get(
      route("admin.dashboard", {
        range,
        table: "gap",
        conv_sort: key,
        conv_dir: nextDirection,
        conv_page: 1,
      }),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ["table_mode", "top_conversion"],
      }
    );
  };

  const requestGapPage = (page: number) => {
    setIsGapLoading(true);
    router.get(
      route("admin.dashboard", {
        range,
        table: "gap",
        conv_sort: gapPagination.sort,
        conv_dir: gapPagination.direction,
        conv_page: page,
      }),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ["table_mode", "top_conversion"],
      }
    );
  };

  const rows = tableMode === "top" ? topPagedRows : displayGapRows;
  const columnCount = tableMode === "top" ? 1 + topColumns.length : 1 + gapColumns.length;
  const isTableEmpty = rows.length === 0;

  const pagination = tableMode === "top"
    ? {
        page: topCurrentPage,
        pages: topTotalPages,
        setPage: (page: number) => setTopPage(page),
      }
    : {
        page: gapCurrentPage,
        pages: gapTotalPages,
        setPage: requestGapPage,
      };

  const paginationActions = [
    {
      key: "first",
      label: t("admin.dashboard.tables.pagination.first"),
      icon: ChevronsLeftIcon,
      getPage: () => 1,
      disabled: pagination.page <= 1,
    },
    {
      key: "previous",
      label: t("admin.dashboard.tables.pagination.previous"),
      icon: ChevronLeftIcon,
      getPage: () => Math.max(1, pagination.page - 1),
      disabled: pagination.page <= 1,
    },
    {
      key: "next",
      label: t("admin.dashboard.tables.pagination.next"),
      icon: ChevronRightIcon,
      getPage: () => Math.min(pagination.pages, pagination.page + 1),
      disabled: pagination.page >= pagination.pages,
    },
    {
      key: "last",
      label: t("admin.dashboard.tables.pagination.last"),
      icon: ChevronsRightIcon,
      getPage: () => pagination.pages,
      disabled: pagination.page >= pagination.pages,
    },
  ];

  const tableCopy = tableMode === "top"
    ? {
        title: t("admin.dashboard.tables.top_title"),
        description: t("admin.dashboard.tables.top_description"),
      }
    : {
        title: t("admin.dashboard.tables.gap_title"),
        description: t("admin.dashboard.tables.gap_description"),
      };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>{tableCopy.title}</CardTitle>
          <CardDescription>{tableCopy.description}</CardDescription>
        </div>
        <ToggleGroup
          type="single"
          variant="outline"
          value={tableMode}
          onValueChange={handleTableModeChange}
        >
          <ToggleGroupItem value="top">{t("admin.dashboard.tables.toggle_top")}</ToggleGroupItem>
          <ToggleGroupItem value="gap">{t("admin.dashboard.tables.toggle_gap")}</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("admin.dashboard.tables.headers.product")}</TableHead>
              {tableMode === "top"
                ? topColumns.map((column) => (
                    <TableHead key={column.key} className="text-right">
                      <SortableHeader
                        label={column.label}
                        sortKey={column.key}
                        activeKey={topSortKey}
                        direction={topSortDirection}
                        onChange={(key) => handleTopSortChange(key as TopSortKey)}
                      />
                    </TableHead>
                  ))
                : gapColumns.map((column) => (
                    <TableHead key={column.key} className="text-right">
                      <SortableHeader
                        label={column.label}
                        sortKey={column.key}
                        activeKey={gapPagination.sort}
                        direction={gapPagination.direction}
                        onChange={(key) => handleGapSortChange(key as GapSortKey)}
                      />
                    </TableHead>
                  ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isTableEmpty ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="text-center text-muted-foreground">
                  {t("admin.dashboard.tables.empty")}
                </TableCell>
              </TableRow>
            ) : (
              tableMode === "top"
                ? topPagedRows.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <ProductCell
                          title={product.title}
                          category={product.category}
                          imageUrl={product.image_url}
                          href={route("admin.products.edit", { product: product.product_id })}
                          fallback={t("admin.dashboard.labels.no_category")}
                        />
                      </TableCell>
                      {topColumns.map((column) => (
                        <TableCell key={column.key} className="text-right">
                          {column.render(product)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                : displayGapRows.map((product) => (
                    <TableRow key={product.product_id}>
                      <TableCell>
                        <ProductCell
                          title={product.title}
                          category={product.category}
                          imageUrl={product.image_url}
                          href={route("admin.products.edit", { product: product.product_id })}
                          fallback={t("admin.dashboard.labels.no_category")}
                        />
                      </TableCell>
                      {gapColumns.map((column) => (
                        <TableCell key={column.key} className="text-right">
                          {column.render(product)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {trans("admin.dashboard.tables.pagination.page_of", {
              page: pagination.page,
              pages: pagination.pages,
            })}
          </div>
          <div className="flex items-center gap-2">
            {paginationActions.map((action) => (
              <Button
                key={action.key}
                variant="outline"
                size="icon"
                onClick={() => pagination.setPage(action.getPage())}
                disabled={action.disabled}
              >
                <action.icon className="h-4 w-4" />
                <span className="sr-only">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
