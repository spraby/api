import type { ComponentProps, CSSProperties, ReactNode } from 'react';

import { Head, usePage } from '@inertiajs/react';

import { cn } from '@/lib/utils';
import type { PageProps } from '@/types/inertia';

/*
 * Building blocks for the public auth pages (login, password reset, password
 * setup). Managers land on them straight from the storefront or from emails,
 * so they mirror the store's seller sign-up form (store: theme/templates/
 * AuthPage.tsx) on a vivid violet backdrop, rather than the admin UI. Colors
 * are fixed, not theme tokens: the store has no dark mode, and these pages
 * should look the same either way.
 */

/**
 * The store's spiral mark (store: public/img/spraby.svg). The viewBox is a
 * square around the drawing's center, so spinning it does not wobble.
 */
function SprabyMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} fill="currentColor" viewBox="0 -30.02 291.95 291.95">
      <path
        d="M268.09,139.3c2.4,39.09-19.92,76-56.2,95.93-31.29,17.23-70.79,19.46-103,2.64-35.4-18.52-56.67-57.43-45-94.29,10.49-32.94,45.53-59.66,84-53.8,16.58,2.58,32,10.84,42,23.44,14.35,18.23,17.63,41.9,4,61.3-4.1,5.68-11.49,10.66-18.4,13.18-13.07,4.87-33.05,2.7-45.3-8.38-4.51-4.1-8.09-12-7.27-18.34v-.06c.94-10.9,9.85-10.84,11.84-2.87a22.18,22.18,0,0,0,1.58,4.28A27.63,27.63,0,0,0,158.8,178.5c17.58,1.76,33-11.66,35.1-27.25,2.11-15.94-8.09-33-21.39-42.66-13.71-10-32.64-14-49.52-9-17.17,5-32.81,16.17-42.07,30.41-10.08,15.47-11.78,36.86-6.33,54,11.19,35.4,52.51,58.14,91.53,55.26,36.45-2.75,68.8-25.66,82.34-56.72,13.36-30.65,7.79-67.69-12.07-94.88-23.15-31.76-62.82-50.51-104-49.28C92.58,39.62,60.29,49.76,32.86,83.63,22.14,96.87,10,116,5.44,132.09c-8.62,30.42,14.47,46.41,26.08,9.67C37,124.47,44.7,107.24,57.65,93.41c27-28.89,69.21-39.67,109.06-29.53,32.17,8.2,56.55,30.94,65,60.77,7.67,27.19.76,58-22.39,77-24.79,20.45-60.77,24.61-89,7.56-14.24-8.61-25.19-22.33-27.36-38.15-2-15.29,2.58-30.65,14.82-41.25,10.14-8.85,24.32-13.36,38.39-10,13.71,3.22,24,12.3,26.78,25.08,2.93,13.83-13.89,22.09-18,8-1.82-6.22-4.75-12.25-9.26-16.24-4.34-3.75-8.32-4.86-14.24-4.51-15.29.94-26.9,17.52-26.25,30.94.82,17.17,8.61,26.31,20.92,34.58,27,18.16,66.1,10.31,84.21-14.89-.18.06-.3.06-.47.12a5.11,5.11,0,0,1,.35-.59,2.9,2.9,0,0,1,.18.53c16.17-25.9,15.7-57.31-4.11-81.51-15.11-18.46-37.85-29.54-62.76-31.41-48-3.58-90.65,31.46-101.09,73.36-11.31,45.25,16,92.89,60.54,113.52,41,18.92,90.3,18.57,127.63-5.57,39.09-25.26,69.45-72.32,64.29-116.44C292.18,112.46,266.74,116.68,268.09,139.3Z"
        transform="translate(-3.56 -38.33)"
      />
    </svg>
  );
}

type CSSVariables = CSSProperties & Record<`--${string}`, string>;

/*
 * Products and tags floating around the card — the same set and motion as the
 * storefront home hero (store: theme/sections/SprabyHero.tsx). Images are
 * copies of the store's public/img/hero/*.webp. Shown only where the screen
 * leaves room beside the card.
 */
const FLOATING_PRODUCTS = [
  { src: '/images/storefront/hero-product-3.webp', width: 170, height: 192, className: 'left-[7%] top-[9%] w-[96px]', rotate: '-rotate-[13deg]', appearDelay: '200ms', floatDelay: '700ms', floatX: '4px', floatY: '-10px' },
  { src: '/images/storefront/hero-product-5.webp', width: 192, height: 190, className: 'left-[3%] top-[47%] w-[72px]', rotate: 'rotate-[13deg]', appearDelay: '350ms', floatDelay: '1750ms', floatX: '-4px', floatY: '-12px' },
  { src: '/images/storefront/hero-product-2.webp', width: 138, height: 192, className: 'left-[11%] bottom-[7%] w-[70px]', rotate: 'rotate-[16deg]', appearDelay: '500ms', floatDelay: '400ms', floatX: '5px', floatY: '-10px' },
  { src: '/images/storefront/hero-product-6.webp', width: 185, height: 192, className: 'right-[9%] top-[7%] w-[84px]', rotate: 'rotate-[9deg]', appearDelay: '250ms', floatDelay: '950ms', floatX: '3px', floatY: '-9px' },
  { src: '/images/storefront/hero-product-4.webp', width: 182, height: 192, className: 'right-[3%] top-[44%] w-[100px]', rotate: 'rotate-[11deg]', appearDelay: '400ms', floatDelay: '1500ms', floatX: '-5px', floatY: '-8px' },
  { src: '/images/storefront/hero-product-1.webp', width: 192, height: 189, className: 'right-[10%] bottom-[8%] w-[80px]', rotate: '-rotate-[9deg]', appearDelay: '550ms', floatDelay: '1100ms', floatX: '-4px', floatY: '-10px' },
];

const FLOATING_TAGS = [
  { lead: 'Made in ', accent: 'Belarus', accentClassName: 'text-store-600', className: 'left-[13%] top-[28%]', rotate: '-rotate-[3deg]', appearDelay: '700ms', floatDelay: '900ms' },
  { lead: 'Limited ', accent: 'edition', accentClassName: 'text-amber-600', className: 'left-[9%] top-[70%]', rotate: 'rotate-[2deg]', appearDelay: '850ms', floatDelay: '1350ms' },
  { lead: 'Handmade with ', accent: 'love', accentClassName: 'text-rose-500', className: 'right-[12%] top-[26%]', rotate: 'rotate-[3deg]', appearDelay: '800ms', floatDelay: '1200ms' },
  { lead: 'Local ', accent: 'brands', accentClassName: 'text-indigo-600', className: 'right-[13%] top-[68%]', rotate: '-rotate-[2deg]', appearDelay: '950ms', floatDelay: '1500ms' },
];

function FloatingDecor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {FLOATING_PRODUCTS.map((item) => (
        <div
          key={item.src}
          className={cn('auth-floater auth-floater-product', item.className)}
          style={{ '--appear-delay': item.appearDelay } as CSSVariables}
        >
          <div
            className="auth-floater-motion"
            style={{
              '--float-delay': item.floatDelay,
              '--float-x': item.floatX,
              '--float-y': item.floatY,
            } as CSSVariables}
          >
            <img alt="" className={cn('auth-floater-art', item.rotate)} height={item.height} src={item.src} width={item.width} />
          </div>
        </div>
      ))}

      {FLOATING_TAGS.map((tag) => (
        <div
          key={tag.accent}
          className={cn('auth-floater', tag.className)}
          style={{ '--appear-delay': tag.appearDelay } as CSSVariables}
        >
          <span
            className="auth-floater-motion inline-flex items-center gap-1 rounded-2xl border border-white/70 bg-white/80 px-3.5 py-2.5 text-sm leading-none font-semibold text-slate-700 shadow-[0_12px_40px_rgba(46,16,101,0.25)] backdrop-blur-[18px]"
            style={{ '--float-delay': tag.floatDelay, '--float-duration': '5800ms', '--float-y': '-7px', '--float-x': '0px' } as CSSVariables}
          >
            <span className={cn('inline-flex items-center gap-1', tag.rotate)}>
              {tag.lead}
              <span className={tag.accentClassName}>{tag.accent}</span>
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

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

      <div className="storefront-auth-bg relative flex min-h-screen w-full items-start justify-center overflow-hidden px-4 pt-6 pb-14 font-storefront text-gray-900 antialiased sm:items-center sm:px-6">
        <div aria-hidden className="storefront-auth-glow -top-32 -left-32 h-[28rem] w-[28rem] bg-fuchsia-400" />
        <div
          aria-hidden
          className="storefront-auth-glow -right-40 -bottom-40 h-[32rem] w-[32rem] bg-indigo-500"
          style={{ animationDelay: '-11s' }}
        />
        <FloatingDecor />

        <div className="relative w-full max-w-xl">
          <div className="rounded-2xl border border-white/20 bg-white shadow-2xl shadow-purple-950/30">
            <div className="border-b border-gray-100 px-6 py-5 sm:px-7">
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-[2.25rem_1fr_2.25rem] items-start gap-3">
                  <a
                    aria-label="Вернуться в магазин"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-store-100 bg-store-50 text-store-700 transition hover:border-store-200 hover:bg-store-100 hover:text-store-800"
                    href={storeUrl}
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M15 5L8 12L15 19"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                  </a>

                  <a
                    className="flex flex-col items-center gap-1 justify-self-center text-base font-semibold tracking-tight text-gray-400 lowercase hover:text-gray-500"
                    href={storeUrl}
                  >
                    <span className="transition-transform duration-500 ease-out hover:scale-125">
                      <SprabyMark className="h-14 w-14 animate-[spin_16s_linear_infinite] text-store-600 motion-reduce:animate-none" />
                    </span>
                    <span className="leading-none">spraby</span>
                  </a>
                </div>
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">{title}</h1>
                {!!description && <p className="text-sm text-gray-500">{description}</p>}
              </div>
            </div>

            <div className="px-6 py-6 sm:px-7 sm:py-7">{children}</div>
          </div>
        </div>
      </div>
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
          'flex min-h-14 cursor-text flex-col justify-center rounded-lg border-2 px-3 py-2 transition-colors',
          error
            ? 'border-red-500 focus-within:border-red-500'
            : 'border-gray-200 hover:border-gray-400 focus-within:border-gray-900 focus-within:hover:border-gray-900',
          readOnly ? 'bg-gray-50' : 'bg-white',
        )}
        htmlFor={id}
      >
        <span className={cn('text-xs font-semibold', error ? 'text-red-500' : 'text-gray-700')}>{label}</span>
        <input
          aria-invalid={!!error}
          className={cn(
            'w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400',
            readOnly && 'text-gray-500',
            className,
          )}
          id={id}
          readOnly={readOnly}
          {...props}
        />
      </label>
      {!!error && <span className="px-1 text-xs text-red-500">{error}</span>}
    </div>
  );
}

export function StorefrontButton({ className, type = 'submit', ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-xl bg-store-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-store-700 focus:ring-2 focus:ring-store-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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
