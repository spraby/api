import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { optionKeys } from "@/lib/api/query-keys";
import { useLang } from "@/lib/lang";

interface OptionItem {
  id: number;
  name: string;
  title: string;
}

async function fetchOptions(): Promise<OptionItem[]> {
  const response = await fetch("/admin/options/api", {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch options");
  }

  const json = await response.json();

  return json.data;
}

interface OptionPickerProps {
  options?: OptionItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  label?: string;
  hint?: string;
  searchPlaceholder?: string;
}

export function OptionPicker({
  options: optionsProp,
  selectedIds,
  onChange,
  label,
  hint,
  searchPlaceholder,
}: OptionPickerProps) {
  const { t } = useLang();
  const [search, setSearch] = useState("");

  const { data: fetchedOptions } = useQuery({
    queryKey: optionKeys.lists(),
    queryFn: fetchOptions,
    enabled: !optionsProp,
  });

  const options = useMemo(
    () => optionsProp ?? fetchedOptions ?? [],
    [optionsProp, fetchedOptions],
  );

  const resolvedLabel = label ?? t("admin.option_picker.label");
  const resolvedHint = hint ?? t("admin.option_picker.hint");
  const resolvedSearchPlaceholder =
    searchPlaceholder ?? t("admin.option_picker.search_placeholder");

  if (options.length === 0) {
    return null;
  }

  const filtered = options.filter(
    (o) => !search || o.name.toLowerCase().includes(search.toLowerCase()) || o.title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Card className="flex flex-col gap-4 md:gap-5 p-4 sm:p-6">
      <div className="gap-2 flex flex-col">
        <Label>{resolvedLabel}</Label>
        <p className="text-xs text-muted-foreground">{resolvedHint}</p>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {options
            .filter((o) => selectedIds.includes(o.id))
            .map((o) => (
              <Badge
                key={o.id}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => {
                  onChange(selectedIds.filter((id) => id !== o.id));
                }}
              >
                {o.title || o.name} &times;
              </Badge>
            ))}
        </div>
      )}

      {options.length > 5 && (
        <Input
          placeholder={resolvedSearchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <div className="max-h-[240px] overflow-y-auto flex flex-col gap-1">
        {filtered.map((o) => {
          const checked = selectedIds.includes(o.id);

          return (
            <label
              key={o.id}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(val) => {
                  onChange(
                    val
                      ? [...selectedIds, o.id]
                      : selectedIds.filter((id) => id !== o.id),
                  );
                }}
              />
              {o.title || o.name}
            </label>
          );
        })}
      </div>
    </Card>
  );
}