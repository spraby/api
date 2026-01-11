/**
 * Duplicate Variants Alert Component
 *
 * Displays a warning banner when duplicate product variants are detected
 */

import { AlertTriangleIcon } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useLang } from '@/lib/lang';

interface DuplicateVariantsAlertProps {
  duplicateGroups: number[][];
}

export function DuplicateVariantsAlert({ duplicateGroups }: DuplicateVariantsAlertProps) {
  const { t } = useLang();

  if (duplicateGroups.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertTriangleIcon className="size-4" />
      <AlertTitle>{t('admin.products_edit.duplicate_variants.title')}</AlertTitle>
      <AlertDescription>
        <p className="mb-2">{t('admin.products_edit.duplicate_variants.description')}</p>
        <ul className="list-inside list-disc space-y-1">
          {duplicateGroups.map((group, groupIndex) => (
            <li key={groupIndex}>
              {t('admin.products_edit.duplicate_variants.group_label')}{' '}
              {group.map((index) => `#${index + 1}`).join(', ')}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
}
