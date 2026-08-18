import * as React from 'react';

import {Link} from '@inertiajs/react';
import {ArrowRightIcon, SparklesIcon, XIcon} from 'lucide-react';
import {toast} from 'sonner';

import type {OnboardingHintKey} from '@/components/onboarding/types';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {SidebarMenuAction, useSidebar} from '@/components/ui/sidebar';
import {updateOnboarding} from '@/lib/api/endpoints/onboarding';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';

export interface MenuHint {
  description: string;
  href: string;
  isCurrent: boolean;
  key: OnboardingHintKey;
  stepLabel: string;
  title: string;
}

export function OnboardingMenuHint({hint}: {hint: MenuHint}) {
  const {isMobile} = useSidebar();
  const {t} = useLang();
  const [open, setOpen] = React.useState(hint.isCurrent);
  const [hidden, setHidden] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  React.useEffect(() => {
    if (hint.isCurrent) {
      setOpen(true);
    }
  }, [hint.isCurrent, hint.key]);

  const closePermanently = async () => {
    setOpen(false);
    setHidden(true);
    setIsClosing(true);

    try {
      await updateOnboarding('hide_hint', hint.key);
    } catch {
      setHidden(false);
      setOpen(true);
      toast.error(t('admin.dashboard.onboarding.errors.update'));
    } finally {
      setIsClosing(false);
    }
  };

  if (hidden) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <SidebarMenuAction
          type="button"
          className={cn(
            'text-chart-2 hover:bg-chart-2/10 hover:text-chart-2',
            hint.isCurrent && 'bg-chart-2/10 text-chart-2',
          )}
          aria-label={hint.title}
          disabled={isClosing}
        >
          <SparklesIcon className={cn(hint.isCurrent && 'animate-pulse')}/>
        </SidebarMenuAction>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side={isMobile ? 'bottom' : 'right'}
        sideOffset={8}
        className="w-[min(16rem,calc(100vw-2rem))] overflow-hidden border-chart-2/30 p-0 shadow-lg"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="border-l-2 border-chart-2 bg-popover p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-chart-2">
                {hint.stepLabel}
              </p>
              <p className="mt-1 text-sm font-semibold leading-5">{hint.title}</p>
            </div>
            <button
              type="button"
              className="-mr-1 -mt-1 flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
              aria-label={t('admin.dashboard.onboarding.actions.close_hint')}
              disabled={isClosing}
              onClick={closePermanently}
            >
              <XIcon className="size-3.5"/>
            </button>
          </div>
          <p className="mt-1.5 text-xs leading-4 text-muted-foreground">{hint.description}</p>
          <Link
            href={hint.href}
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-chart-2 hover:underline"
            onClick={() => setOpen(false)}
          >
            {t('admin.dashboard.onboarding.actions.go')}
            <ArrowRightIcon className="size-3.5"/>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
