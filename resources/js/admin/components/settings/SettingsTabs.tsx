import {type ReactNode, useCallback, useMemo} from 'react';

import {router, usePage} from '@inertiajs/react';

import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {useMediaQuery} from '@/hooks/use-media-query';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {PageProps} from '@/types/inertia';

import type {LucideIcon} from 'lucide-react';

export interface SettingsTab<T extends string> {
    icon: LucideIcon;
    id: T;
    labelKey: string;
}

interface SettingsTabsProps<T extends string> {
    children: ReactNode;
    /** NoInfer: T выводится из tabs, defaultTab только проверяется по нему. */
    defaultTab: NoInfer<T>;
    queryKey?: string;
    tabs: readonly SettingsTab<T>[];
}

/**
 * Tailwind не видит классы, собранные конкатенацией, поэтому раскладка
 * подбирается по числу вкладок из готовых литералов. На lg список всегда
 * вертикальный — за это отвечает lg:grid-cols-1 в базовых классах.
 */
const COLUMNS_BY_TAB_COUNT: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-5',
};

const FALLBACK_COLUMNS = 'grid-cols-2 sm:grid-cols-3';

/** page.url у Inertia относительный; база нужна только для разбора и наружу не уходит. */
const URL_PARSE_BASE = 'http://relative.invalid';

/** Совпадает с брейкпоинтом lg, на котором список вкладок встаёт вертикально. */
const DESKTOP_QUERY = '(min-width: 1024px)';

export default function SettingsTabs<T extends string>({
    children,
    defaultTab,
    queryKey = 'tab',
    tabs,
}: SettingsTabsProps<T>) {
    const {t} = useLang();
    const {url} = usePage<PageProps>();
    const isDesktop = useMediaQuery(DESKTOP_QUERY);

    const activeTab = useMemo(() => {
        const fromUrl = new URL(url, URL_PARSE_BASE).searchParams.get(queryKey);

        return tabs.some((tab) => tab.id === fromUrl) ? (fromUrl as T) : defaultTab;
    }, [defaultTab, queryKey, tabs, url]);

    const handleValueChange = useCallback((value: string) => {
        const target = new URL(url, URL_PARSE_BASE);

        if (value === defaultTab) {
            target.searchParams.delete(queryKey);
        } else {
            target.searchParams.set(queryKey, value);
        }

        // Клиентский переход: без запроса на сервер, но с записью в history —
        // вкладка попадает в ссылку и переживает F5 и кнопку «назад».
        router.push({
            url: `${target.pathname}${target.search}${target.hash}`,
            preserveScroll: true,
            preserveState: true,
        });
    }, [defaultTab, queryKey, url]);

    return (
        <Tabs
            // manual: стрелки только переносят фокус. Иначе каждое нажатие
            // писало бы запись в history и монтировало тяжёлую секцию.
            activationMode="manual"
            className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6"
            onValueChange={handleValueChange}
            orientation={isDesktop ? 'vertical' : 'horizontal'}
            value={activeTab}
        >
            <TabsList
                aria-label={t('admin.settings_tabs.aria_label')}
                className={cn(
                    'grid h-auto w-full items-stretch justify-normal gap-1 bg-transparent p-0 lg:w-48 lg:shrink-0 lg:grid-cols-1 lg:self-start',
                    COLUMNS_BY_TAB_COUNT[tabs.length] ?? FALLBACK_COLUMNS,
                )}
            >
                {tabs.map((tab) => {
                    const Icon = tab.icon;

                    return (
                        <TabsTrigger
                            key={tab.id}
                            className="flex min-h-11 min-w-0 gap-2 px-3 py-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground data-[state=active]:bg-muted data-[state=active]:shadow-none lg:justify-start lg:gap-3"
                            value={tab.id}
                        >
                            <Icon className="size-4 shrink-0"/>
                            <span className="truncate">{t(tab.labelKey)}</span>
                        </TabsTrigger>
                    );
                })}
            </TabsList>

            <div className="min-w-0 flex-1">{children}</div>
        </Tabs>
    );
}

export function SettingsTabsPanel({children, value}: { children: ReactNode, value: string }) {
    return (
        <TabsContent className="mt-0 min-w-0" value={value}>
            {children}
        </TabsContent>
    );
}
