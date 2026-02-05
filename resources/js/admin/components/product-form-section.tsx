import type { ReactNode } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ProductFormSectionProps {
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'card' | 'plain';
  hideHeader?: boolean;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function ProductFormSection({
  title,
  description,
  action,
  variant = 'card',
  hideHeader = false,
  className,
  contentClassName,
  children,
}: ProductFormSectionProps) {
  if (variant === 'plain') {
    return (
      <div className={cn('space-y-3', className)}>
        {!hideHeader ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-foreground sm:text-base">{title}</div>
              {description ? (
                <div className="text-xs text-muted-foreground sm:text-sm">{description}</div>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        ) : null}
        <div className={cn('space-y-4', contentClassName)}>{children}</div>
      </div>
    );
  }

  return (
    <Card className={cn('border bg-card/80 shadow-sm', className)}>
      {!hideHeader ? (
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
              {description ? (
                <CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
              ) : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
        </CardHeader>
      ) : null}
      <CardContent className={cn('space-y-4', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
