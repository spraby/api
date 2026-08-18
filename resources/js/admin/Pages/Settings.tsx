import {useState} from 'react';

import {usePage} from '@inertiajs/react';
import {Building2Icon, MapPinIcon, MenuIcon, PhoneIcon, TruckIcon} from 'lucide-react';

import AddressesSection from '@/components/settings/AddressesSection';
import ContactsSection from '@/components/settings/ContactsSection';
import DeliverySection from '@/components/settings/DeliverySection';
import GeneralSection from '@/components/settings/GeneralSection';
import type {MenuNode, MenuOption} from '@/components/settings/menu/types';
import MenuSection from '@/components/settings/MenuSection';
import ShippingConstructorsSection from '@/components/settings/ShippingConstructorsSection';
import {Separator} from '@/components/ui/separator';
import AdminLayout from '@/layouts/AdminLayout';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {
    Address,
    BrandShippingMethod,
    ContactsMap,
    ShippingConstructorOption,
    ShippingFieldDef,
    ShippingMethodConstructor,
} from '@/types/api';
import type {PageProps} from '@/types/inertia';

interface SettingsPageProps extends Record<string, unknown> {
    addresses: Address[];
    contacts: ContactsMap;
    shippingConstructors: ShippingConstructorOption[];
    brandShippingMethods: BrandShippingMethod[];
    about: string;
    refundPolicy: string;
    allShippingConstructors?: ShippingMethodConstructor[];
    merchantFieldsCatalog?: ShippingFieldDef[];
    customerFieldsCatalog?: ShippingFieldDef[];
    menu?: MenuNode[];
    menuCollections?: MenuOption[];
    menuCategories?: MenuOption[];
    menuMaxDepth?: number;
}

const tabs = [
    {id: 'general', icon: Building2Icon, label_ru: 'Основные', label_en: 'General'},
    {id: 'addresses', icon: MapPinIcon, label_ru: 'Адреса', label_en: 'Addresses'},
    {id: 'delivery', icon: TruckIcon, label_ru: 'Доставка', label_en: 'Delivery'},
    {id: 'contacts', icon: PhoneIcon, label_ru: 'Контакты', label_en: 'Contacts'},
] as const;

type TabId = (typeof tabs)[number]['id'];

interface SettingsNavigationProps<T extends string> {
    activeTab: T;
    className?: string;
    locale: string;
    onChange: (tab: T) => void;
    tabs: readonly {
        id: T;
        icon: typeof Building2Icon;
        label_ru: string;
        label_en: string;
    }[];
}

function SettingsNavigation<T extends string>({
    activeTab,
    className,
    locale,
    onChange,
    tabs: navigationTabs,
}: SettingsNavigationProps<T>) {
    return (
        <nav
            aria-label={locale === 'ru' ? 'Разделы настроек' : 'Settings sections'}
            className={cn(
                'grid gap-1 lg:w-48 lg:shrink-0 lg:grid-cols-1 lg:self-start',
                className,
            )}
        >
            {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                const label = locale === 'ru' ? tab.label_ru : tab.label_en;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        aria-pressed={activeTab === tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            'flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors lg:justify-start lg:gap-3',
                            activeTab === tab.id
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                        )}
                    >
                        <Icon className="size-4 shrink-0"/>
                        <span className="truncate">{label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

function ManagerSettings({
    addresses,
    contacts,
    shippingConstructors,
    brandShippingMethods,
    about,
    refundPolicy,
    locale,
}: {
    addresses: Address[];
    contacts: ContactsMap;
    shippingConstructors: ShippingConstructorOption[];
    brandShippingMethods: BrandShippingMethod[];
    about: string;
    refundPolicy: string;
    locale: string;
}) {
    const [activeTab, setActiveTab] = useState<TabId>('general');

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
            <SettingsNavigation
                activeTab={activeTab}
                className="grid-cols-2 sm:grid-cols-4"
                locale={locale}
                onChange={setActiveTab}
                tabs={tabs}
            />

            <div className="min-w-0 flex-1">
                {activeTab === 'general' && <GeneralSection about={about} refundPolicy={refundPolicy}/>}
                {activeTab === 'addresses' && <AddressesSection addresses={addresses}/>}
                {activeTab === 'delivery' && <DeliverySection constructors={shippingConstructors} brandMethods={brandShippingMethods}/>}
                {activeTab === 'contacts' && <ContactsSection contacts={contacts}/>}
            </div>
        </div>
    );
}

const adminTabs = [
    {id: 'menu', icon: MenuIcon, label_ru: 'Меню', label_en: 'Menu'},
    {id: 'delivery', icon: TruckIcon, label_ru: 'Доставка', label_en: 'Delivery'},
] as const;

type AdminTabId = (typeof adminTabs)[number]['id'];

function AdminSettings({
    menu,
    collections,
    categories,
    maxDepth,
    constructors,
    merchantCatalog,
    customerCatalog,
    locale,
}: {
    menu: MenuNode[];
    collections: MenuOption[];
    categories: MenuOption[];
    maxDepth: number;
    constructors: ShippingMethodConstructor[];
    merchantCatalog: ShippingFieldDef[];
    customerCatalog: ShippingFieldDef[];
    locale: string;
}) {
    const [activeTab, setActiveTab] = useState<AdminTabId>('menu');

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row lg:gap-6">
            <SettingsNavigation
                activeTab={activeTab}
                className="grid-cols-2"
                locale={locale}
                onChange={setActiveTab}
                tabs={adminTabs}
            />

            <div className="min-w-0 flex-1">
                {activeTab === 'menu' && (
                    <MenuSection
                        menu={menu}
                        collections={collections}
                        categories={categories}
                        maxDepth={maxDepth}
                    />
                )}
                {activeTab === 'delivery' && (
                    <ShippingConstructorsSection
                        constructors={constructors}
                        merchantCatalog={merchantCatalog}
                        customerCatalog={customerCatalog}
                    />
                )}
            </div>
        </div>
    );
}

export default function Settings() {
    const {t, locale} = useLang();
    const {
        auth,
        addresses,
        contacts,
        shippingConstructors,
        brandShippingMethods,
        about,
        refundPolicy,
        allShippingConstructors,
        merchantFieldsCatalog,
        customerFieldsCatalog,
        menu,
        menuCollections,
        menuCategories,
        menuMaxDepth,
    } = usePage<PageProps<SettingsPageProps>>().props;

    return (
        <AdminLayout title={t('admin.nav.settings')}>
            <div className="flex min-w-0 flex-1 flex-col gap-4">
                <h1 className="text-2xl font-semibold">{t('admin.nav.settings')}</h1>
                <Separator/>

                {auth.user.is_admin ? (
                    <AdminSettings
                        menu={menu ?? []}
                        collections={menuCollections ?? []}
                        categories={menuCategories ?? []}
                        maxDepth={menuMaxDepth ?? 3}
                        constructors={allShippingConstructors ?? []}
                        merchantCatalog={merchantFieldsCatalog ?? []}
                        customerCatalog={customerFieldsCatalog ?? []}
                        locale={locale}
                    />
                ) : (
                    <ManagerSettings addresses={addresses} contacts={contacts} shippingConstructors={shippingConstructors} brandShippingMethods={brandShippingMethods} about={about} refundPolicy={refundPolicy} locale={locale}/>
                )}
            </div>
        </AdminLayout>
    );
}
