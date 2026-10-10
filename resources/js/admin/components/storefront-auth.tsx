import type { ComponentProps, ReactNode } from 'react';

import { Head, usePage } from '@inertiajs/react';

import { cn } from '@/lib/utils';
import type { PageProps } from '@/types/inertia';

/* Public auth pages share the storefront's light palette and glass surfaces.
 * Fixed colors keep them consistent when the admin uses dark mode. */
interface StorefrontAuthLayoutProps {
  title: string;
  description?: ReactNode;
  children: ReactNode;
}

export function StorefrontAuthLayout({ title, description, children }: StorefrontAuthLayoutProps) {
  const { storeUrl } = usePage<PageProps>().props;

  return (
    <>
      <Head title={title} />

      <main className="storefront-auth-bg flex min-h-screen min-h-[100svh] w-full items-start justify-center px-4 py-8 font-storefront text-gray-900 antialiased sm:items-center sm:px-6 sm:py-12">
        <div className="storefront-auth-card w-full max-w-[400px] rounded-3xl p-5 sm:p-7">
          <div className="mb-6">
            <div className="mb-5 grid grid-cols-[2.75rem_1fr_2.75rem] items-center gap-2">
              <a
                aria-label="Вернуться на главную"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white bg-white/60 text-gray-600 transition-colors hover:bg-white hover:text-store-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-600"
                href={storeUrl}
              >
                <svg aria-hidden className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <path d="M15 5L8 12L15 19" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
              </a>
              <a
                aria-label="spraby — главная"
                className="justify-self-center rounded-lg text-2xl font-bold tracking-tight text-store-600 lowercase focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-store-600"
                href={storeUrl}
              >
                spraby
              </a>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">{title}</h1>
            {!!description && <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>}
          </div>
          {children}
        </div>
      </main>
    </>
  );
}

interface StorefrontFieldProps extends ComponentProps<'input'> {
  id: string;
  label: string;
  error?: ReactNode;
}

/**
 * Bordered input with the label inside the box, like the store's NextUI
 * `variant="bordered"` fields.
 */
export function StorefrontField({ id, label, error, className, readOnly, ...props }: StorefrontFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className={cn(
          'flex min-h-14 cursor-text flex-col justify-center rounded-xl border px-3 py-2 transition-colors',
          error
            ? 'border-red-500 focus-within:border-red-500'
            : 'border-gray-200 hover:border-store-200 focus-within:border-store-600 focus-within:ring-2 focus-within:ring-store-100',
          readOnly ? 'bg-gray-50' : 'bg-white/70',
        )}
        htmlFor={id}
      >
        <span className={cn('text-xs font-semibold', error ? 'text-red-500' : 'text-gray-700')}>{label}</span>
        <input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          className={cn(
            'w-full min-w-0 bg-transparent text-base text-gray-900 sm:text-sm outline-none placeholder:text-gray-400',
            readOnly && 'text-gray-500',
            className,
          )}
          id={id}
          readOnly={readOnly}
          {...props}
        />
      </label>
      {!!error && <span className="px-1 text-xs text-red-500" id={`${id}-error`}>{error}</span>}
    </div>
  );
}

export function StorefrontButton({ className, type = 'submit', ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-store-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-store-700 focus:ring-2 focus:ring-store-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      type={type}
      {...props}
    />
  );
}

const NOTICE_STYLES = {
  success: { box: 'border-green-200 bg-green-50 text-green-700', badge: 'bg-green-600', mark: '✓' },
  error: { box: 'border-red-200 bg-red-50 text-red-700', badge: 'bg-red-600', mark: '!' },
  info: { box: 'border-store-100 bg-store-50 text-store-800', badge: 'bg-store-600', mark: 'i' },
} as const;

interface StorefrontNoticeProps {
  variant: keyof typeof NOTICE_STYLES;
  title?: string;
  children: ReactNode;
}

export function StorefrontNotice({ variant, title, children }: StorefrontNoticeProps) {
  const style = NOTICE_STYLES[variant];

  return (
    <div className={cn('flex items-start gap-3 rounded-lg border px-4 py-3 text-sm', style.box)}>
      <span
        className={cn(
          'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white',
          style.badge,
        )}
      >
        {style.mark}
      </span>
      <div>
        {!!title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

/** Text link in the store's accent color — for both `<a>` and Inertia `<Link>`. */
export const storefrontLinkClass =
  'font-medium text-store-700 underline-offset-4 hover:text-store-800 hover:underline';
