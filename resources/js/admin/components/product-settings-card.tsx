import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ProductFormSection } from '@/components/product-form-section';
import type { Category } from '@/types/models';

interface ProductSettingsCardProps {
  title: string;
  enabledLabel: string;
  enabledStatusLabel: string;
  disabledStatusLabel: string;
  enabled: boolean;
  onEnabledChange: (value: boolean) => void;
  enabledError?: string;
  categoryLabel: string;
  categoryPlaceholder: string;
  categoryError?: string;
  categories: Category[];
  selectedCategoryId: number | null;
  hasCategoryInList: boolean;
  onCategoryChange: (value: number) => void;
  isCategoryLocked: boolean;
  categoryLockedHint?: string;
  noCategoryMessage: string;
  sectionVariant?: 'card' | 'plain';
  hideHeader?: boolean;
  className?: string;
}

export function ProductSettingsCard({
  title,
  enabledLabel,
  enabledStatusLabel,
  disabledStatusLabel,
  enabled,
  onEnabledChange,
  enabledError,
  categoryLabel,
  categoryPlaceholder,
  categoryError,
  categories,
  selectedCategoryId,
  hasCategoryInList,
  onCategoryChange,
  isCategoryLocked,
  categoryLockedHint,
  noCategoryMessage,
  sectionVariant = 'card',
  hideHeader = false,
  className,
}: ProductSettingsCardProps) {
  const statusLabel = enabled ? enabledStatusLabel : disabledStatusLabel;
  const statusClassName = enabled
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";

  return (
    <ProductFormSection
      title={title}
      variant={sectionVariant}
      hideHeader={hideHeader}
      className={className}
    >
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-medium" htmlFor="enabled">
            {enabledLabel}
          </Label>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-muted/40 px-3 py-2">
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                id="enabled"
                onCheckedChange={(value) => onEnabledChange(value as boolean)}
              />
              <Badge className={statusClassName} variant="outline">
                {statusLabel}
              </Badge>
            </div>
          </div>
          {enabledError ? <p className="text-xs text-destructive">{enabledError}</p> : null}
        </div>

        {hasCategoryInList ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">{categoryLabel}</Label>
            <Select
              disabled={isCategoryLocked}
              value={selectedCategoryId ? selectedCategoryId.toString() : ''}
              onValueChange={(value) => {
                if (value?.length) {
                  onCategoryChange(Number(value));
                }
              }}
            >
              <SelectTrigger id="category" className={categoryError ? 'border-destructive' : ''}>
                <SelectValue placeholder={categoryPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  category?.id ? (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ) : null
                ))}
              </SelectContent>
            </Select>
            {categoryError ? <p className="text-xs text-destructive">{categoryError}</p> : null}
            {!isCategoryLocked && categoryLockedHint ? (
              <p className="text-xs text-muted-foreground">{categoryLockedHint}</p>
            ) : null}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertDescription>{noCategoryMessage}</AlertDescription>
          </Alert>
        )}
      </div>
    </ProductFormSection>
  );
}
