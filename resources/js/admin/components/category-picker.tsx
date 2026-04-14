import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { categoryKeys } from "@/lib/api/query-keys";
import { useLang } from "@/lib/lang";

interface CategoryOption {
  id: number;
  name: string;
}

async function fetchCategories(): Promise<CategoryOption[]> {
  const response = await fetch("/admin/categories/api", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  const json = await response.json();

  return json.data;
}

interface CategoryPickerProps {
  categories?: CategoryOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  label?: string;
  hint?: string;
  searchPlaceholder?: string;
}

export function CategoryPicker({
  categories: categoriesProp,
  selectedIds,
  onChange,
  label,
  hint,
  searchPlaceholder,
}: CategoryPickerProps) {
  const { t } = useLang();
  const [search, setSearch] = useState("");

  const { data: fetchedCategories } = useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: fetchCategories,
    enabled: !categoriesProp,
  });

  const categories = useMemo(
    () => categoriesProp ?? fetchedCategories ?? [],
    [categoriesProp, fetchedCategories],
  );

  const resolvedLabel = label ?? t("admin.category_picker.label");
  const resolvedHint = hint ?? t("admin.category_picker.hint");
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("admin.category_picker.search_placeholder");

  if (categories.length === 0) {
    return null;
  }

  const filtered = categories.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
      <div className="gap-2 flex flex-col">
        <Label>{resolvedLabel}</Label>
        <p className="text-xs text-muted-foreground">{resolvedHint}</p>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categories
            .filter((c) => selectedIds.includes(c.id))
            .map((c) => (
              <Badge
                key={c.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  onChange(selectedIds.filter((id) => id !== c.id));
                }}
              >
                {c.name} &times;
              </Badge>
            ))}
        </div>
      )}

      {categories.length > 5 && (
        <Input
          placeholder={resolvedSearchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <div className="max-h-[240px] overflow-y-auto flex flex-col gap-1">
        {filtered.map((c) => {
          const checked = selectedIds.includes(c.id);

          return (
            <label
              key={c.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(val) => {
                  onChange(
                    val
                      ? [...selectedIds, c.id]
                      : selectedIds.filter((id) => id !== c.id),
                  );
                }}
              />
              {c.name}
            </label>
          );
        })}
      </div>
    </Card>
  );
}