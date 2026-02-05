import type { ReactNode } from 'react';

import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ProductPageHeaderProps {
  title: string;
  description?: string;
  onBack: () => void;
  meta?: ReactNode;
  actions?: ReactNode;
}

export function ProductPageHeader({
  title,
  description,
  onBack,
  meta,
  actions,
}: ProductPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Button className="size-8" size="icon" type="button" variant="ghost" onClick={onBack}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
        </div>
        {description ? <p className="pl-10 text-sm text-muted-foreground">{description}</p> : null}
        {meta ? <div className="pl-10">{meta}</div> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
