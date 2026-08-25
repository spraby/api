import * as React from 'react';

import {Link} from '@inertiajs/react';
import {
  CheckIcon,
  ChevronRightIcon,
  FolderTreeIcon,
  PackagePlusIcon,
  Settings2Icon,
  SparklesIcon,
  XIcon,
} from 'lucide-react';
import {toast} from 'sonner';

import type {OnboardingMainStep, OnboardingState} from '@/components/onboarding/types';
import {Button} from '@/components/ui/button';
import {ONBOARDING_UPDATED_EVENT, updateOnboarding} from '@/lib/api/endpoints/onboarding';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';

interface AdminOnboardingProps {
  onboarding: OnboardingState;
}

interface Checkpoint {
  complete: boolean;
  href: string;
  icon: React.ComponentType<{className?: string}>;
  key: Exclude<OnboardingMainStep, 'complete'>;
  label: string;
  status: string;
}

function checkpointStatus(
  key: Checkpoint['key'],
  onboarding: OnboardingState,
  t: (key: string) => string,
): string {
  if (key === 'categories') {
    return t(`admin.dashboard.onboarding.categories.status.${onboarding.steps.categories.status}`);
  }

  if (key === 'settings' && onboarding.steps.settings.resolved_count > 0) {
    return `${onboarding.steps.settings.resolved_count}/${onboarding.steps.settings.total}`;
  }

  if (key === 'product' && onboarding.steps.product.blocked) {
    return t('admin.dashboard.onboarding.strip.waiting');
  }

  return t(onboarding.steps[key].completed
    ? 'admin.dashboard.onboarding.status.completed'
    : 'admin.dashboard.onboarding.status.not_started');
}

function CheckpointLink({checkpoint, isCurrent}: {checkpoint: Checkpoint; isCurrent: boolean}) {
  const IconComponent = checkpoint.icon;

  return (
    <Link
      href={checkpoint.href}
      className="group relative z-10 flex min-w-0 flex-col items-center text-center focus-visible:outline-none"
      aria-current={isCurrent ? 'step' : undefined}
    >
      <span
        className={cn(
          'flex size-7 items-center justify-center rounded-full border bg-background transition-all group-hover:scale-105 group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 sm:size-8',
          checkpoint.complete && 'border-chart-2 bg-chart-2 text-white ring-4 ring-chart-2/10',
          isCurrent && !checkpoint.complete && 'border-2 border-chart-2 text-chart-2 ring-4 ring-chart-2/10',
          !checkpoint.complete && !isCurrent && 'border-border text-muted-foreground',
        )}
      >
        {checkpoint.complete ? <CheckIcon className="size-3.5 sm:size-4"/> : <IconComponent className="size-3.5 sm:size-4"/>}
      </span>
      <span className={cn('mt-2 max-w-full truncate text-[11px] font-medium sm:text-xs', isCurrent && 'text-chart-2')}>
        {checkpoint.label}
      </span>
      <span className="mt-0.5 max-w-full truncate text-[10px] text-muted-foreground">
        {checkpoint.status}
      </span>
    </Link>
  );
}

export function AdminOnboarding({onboarding}: AdminOnboardingProps) {
  const {t, trans} = useLang();
  const [state, setState] = React.useState(onboarding);
  const [isExpanded, setIsExpanded] = React.useState(onboarding.visible);
  const [isDismissing, setIsDismissing] = React.useState(false);

  React.useEffect(() => {
    setState(onboarding);
    setIsExpanded(onboarding.visible);
  }, [onboarding]);

  React.useEffect(() => {
    const handleUpdate = (event: Event) => {
      const nextState = (event as CustomEvent<OnboardingState>).detail;

      setState(nextState);
      if (!nextState.visible) {
        setIsExpanded(false);
      }
    };

    window.addEventListener(ONBOARDING_UPDATED_EVENT, handleUpdate);

    return () => window.removeEventListener(ONBOARDING_UPDATED_EVENT, handleUpdate);
  }, []);

  const dismiss = async () => {
    setIsDismissing(true);

    try {
      setState(await updateOnboarding('dismiss'));
      setIsExpanded(false);
    } catch {
      toast.error(t('admin.dashboard.onboarding.errors.update'));
    } finally {
      setIsDismissing(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        type="button"
        className="flex size-9 items-center justify-center rounded-xl border border-chart-2/30 bg-card text-chart-2 shadow-xs transition-colors hover:bg-chart-2/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chart-2/40"
        aria-label={t('admin.dashboard.onboarding.actions.expand')}
        title={t('admin.dashboard.onboarding.actions.expand')}
        onClick={() => setIsExpanded(true)}
      >
        <SparklesIcon className="size-4"/>
      </button>
    );
  }

  const checkpoints: Checkpoint[] = [
    {
      key: 'categories',
      label: t('admin.dashboard.onboarding.strip.categories'),
      status: checkpointStatus('categories', state, t),
      complete: state.steps.categories.completed,
      icon: FolderTreeIcon,
      href: route('admin.my-categories'),
    },
    {
      key: 'settings',
      label: t('admin.dashboard.onboarding.strip.settings'),
      status: checkpointStatus('settings', state, t),
      complete: state.steps.settings.completed,
      icon: Settings2Icon,
      href: route('admin.settings'),
    },
    {
      key: 'product',
      label: t('admin.dashboard.onboarding.strip.product'),
      status: checkpointStatus('product', state, t),
      complete: state.steps.product.completed,
      icon: PackagePlusIcon,
      href: state.steps.product.blocked ? route('admin.my-categories') : route('admin.products.create'),
    },
  ];
  const currentCheckpoint = checkpoints.find((checkpoint) => checkpoint.key === state.progress.current_step);
  const lineProgress = state.progress.completed <= 1
    ? 0
    : ((state.progress.completed - 1) / (state.progress.total - 1)) * 100;

  return (
    <section className="overflow-hidden rounded-xl border border-chart-2/30 bg-card px-3 py-3 sm:px-4">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-chart-2 text-white">
          <SparklesIcon className="size-4"/>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold">
              {t(`admin.dashboard.onboarding.current.${state.progress.current_step}`)}
            </h2>
            <span className="shrink-0 rounded-full bg-chart-2/10 px-2 py-0.5 text-[10px] font-semibold text-chart-2">
              {trans('admin.dashboard.onboarding.progress.value', {
                completed: state.progress.completed,
                total: state.progress.total,
              })}
            </span>
          </div>
        </div>
        {currentCheckpoint ? (
          <Button asChild size="sm" className="hidden h-8 rounded-full bg-chart-2 px-3 text-white hover:bg-chart-2/90 sm:inline-flex">
            <Link href={currentCheckpoint.href}>
              {t('admin.dashboard.onboarding.actions.continue')}
              <ChevronRightIcon/>
            </Link>
          </Button>
        ) : null}
        {state.can_dismiss ? (
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
            aria-label={t('admin.dashboard.onboarding.actions.dismiss')}
            disabled={isDismissing}
            onClick={dismiss}
          >
            <XIcon className="size-4"/>
          </button>
        ) : null}
      </div>

      <div className="relative mt-3 px-[8.33%]">
        <div className="absolute left-[16.66%] right-[16.66%] top-3 h-0.5 overflow-hidden rounded-full bg-chart-2/15 sm:top-3.5">
          <div
            className="h-full rounded-full bg-chart-2 transition-[width] duration-500"
            style={{width: `${lineProgress}%`}}
          />
        </div>
        <div className="grid grid-cols-3">
          {checkpoints.map((checkpoint) => (
            <CheckpointLink
              key={checkpoint.key}
              checkpoint={checkpoint}
              isCurrent={state.progress.current_step === checkpoint.key}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
