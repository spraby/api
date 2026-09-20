import {useCallback} from 'react';

import {useForm, usePage} from '@inertiajs/react';
import {Building2Icon, InfoIcon, MapPinIcon, MenuIcon, PhoneIcon, TruckIcon} from 'lucide-react';

import AddressesSection from '@/components/settings/AddressesSection';
import BrandPageSection, {type BrandPageSectionProps} from '@/components/settings/BrandPageSection';
import ContactsSection from '@/components/settings/ContactsSection';
import DeliverySection from '@/components/settings/DeliverySection';
import GeneralSection from '@/components/settings/GeneralSection';
import InformationSection from '@/components/settings/InformationSection';
import type {MenuNode, MenuOption} from '@/components/settings/menu/types';
import MenuSection from '@/components/settings/MenuSection';
import SettingsTabs, {SettingsTabsPanel} from '@/components/settings/SettingsTabs';
import ShippingConstructorsSection from '@/components/settings/ShippingConstructorsSection';
import {Separator} from '@/components/ui/separator';
import AdminLayout from '@/layouts/AdminLayout';
import {useLang} from '@/lib/lang';
import type {
    Address,
    BrandImage,
    BrandShippingMethod,
    ContactsMap,
    ShippingConstructorOption,
    ShippingFieldDef,
    ShippingMethodConstructor,
} from '@/types/api';
import type {PageProps} from '@/types/inertia';

/** Приходит с сервера в snake_case — как отдаёт SettingsController. */
interface BrandPageData {
    page_status: BrandPageSectionProps['pageStatus'];
    page_published_at: string | null;
    page_url: string | null;
    request: BrandPageSectionProps['request'];
}

interface SettingsPageProps extends Record<string, unknown> {
    addresses: Address[];
    contacts: ContactsMap;
    shippingConstructors: ShippingConstructorOption[];
    brandShippingMethods: BrandShippingMethod[];
    about: string;
    refundPolicy: string;
    image: BrandImage | null;
    brandPage: BrandPageData | null;
    allShippingConstructors?: ShippingMethodConstructor[];
    merchantFieldsCatalog?: ShippingFieldDef[];
    customerFieldsCatalog?: ShippingFieldDef[];
    menu?: MenuNode[];
    menuCollections?: MenuOption[];
    menuCategories?: MenuOption[];
    menuMaxDepth?: number;
    information?: string;
    informationMaxLength?: number;
}

const tabs = [
    {id: 'general', icon: Building2Icon, labelKey: 'admin.settings_tabs.general'},
    {id: 'addresses', icon: MapPinIcon, labelKey: 'admin.settings_tabs.addresses'},
    {id: 'delivery', icon: TruckIcon, labelKey: 'admin.settings_tabs.delivery'},
    {id: 'contacts', icon: PhoneIcon, labelKey: 'admin.settings_tabs.contacts'},
] as const;

function ManagerSettings({
    addresses,
    contacts,
    shippingConstructors,
    brandShippingMethods,
    about,
    refundPolicy,
    image,
    brandPage,
}: {
    addresses: Address[];
    contacts: ContactsMap;
    shippingConstructors: ShippingConstructorOption[];
    brandShippingMethods: BrandShippingMethod[];
    about: string;
    refundPolicy: string;
    image: BrandImage | null;
    brandPage: BrandPageData | null;
}) {
    const {post, processing} = useForm({});

    // Тост показывает AdminLayout по flash-сообщению от сервера —
    // второй раз здесь его показывать не нужно.
    const handleBrandPageSubmit = useCallback(() => {
        post(route('admin.settings.brand-page.request'), {preserveScroll: true});
    }, [post]);

    return (
        <SettingsTabs defaultTab="general" tabs={tabs}>
            <SettingsTabsPanel value="general">
                <div className="flex min-w-0 flex-col gap-4">
                    <GeneralSection about={about} refundPolicy={refundPolicy} image={image}/>
                    {brandPage ? (
                        <BrandPageSection
                            isSubmitting={processing}
                            pagePublishedAt={brandPage.page_published_at}
                            pageStatus={brandPage.page_status}
                            pageUrl={brandPage.page_url}
                            request={brandPage.request}
                            onSubmit={handleBrandPageSubmit}
                        />
                    ) : null}
                </div>
            </SettingsTabsPanel>
            <SettingsTabsPanel value="addresses">
                <AddressesSection addresses={addresses}/>
            </SettingsTabsPanel>
            <SettingsTabsPanel value="delivery">
                <DeliverySection constructors={shippingConstructors} brandMethods={brandShippingMethods}/>
            </SettingsTabsPanel>
            <SettingsTabsPanel value="contacts">
                <ContactsSection contacts={contacts}/>
            </SettingsTabsPanel>
        </SettingsTabs>
    );
}

const adminTabs = [
    {id: 'menu', icon: MenuIcon, labelKey: 'admin.settings_tabs.menu'},
    {id: 'delivery', icon: TruckIcon, labelKey: 'admin.settings_tabs.delivery'},
    {id: 'information', icon: InfoIcon, labelKey: 'admin.settings_tabs.information'},
] as const;

function AdminSettings({
    menu,
    collections,
    categories,
    maxDepth,
    constructors,
    merchantCatalog,
    customerCatalog,
    information,
    informationMaxLength,
}: {
    menu: MenuNode[];
    collections: MenuOption[];
    categories: MenuOption[];
    maxDepth: number;
    constructors: ShippingMethodConstructor[];
    merchantCatalog: ShippingFieldDef[];
    customerCatalog: ShippingFieldDef[];
    information: string;
    informationMaxLength: number;
}) {
    return (
        <SettingsTabs defaultTab="menu" tabs={adminTabs}>
            <SettingsTabsPanel value="menu">
                <MenuSection
                    menu={menu}
                    collections={collections}
                    categories={categories}
                    maxDepth={maxDepth}
                />
            </SettingsTabsPanel>
            <SettingsTabsPanel value="delivery">
                <ShippingConstructorsSection
                    constructors={constructors}
                    merchantCatalog={merchantCatalog}
                    customerCatalog={customerCatalog}
                />
            </SettingsTabsPanel>
            <SettingsTabsPanel value="information">
                <InformationSection information={information} maxLength={informationMaxLength}/>
            </SettingsTabsPanel>
        </SettingsTabs>
    );
}

export default function Settings() {
    const {t} = useLang();
    const {
        auth,
        addresses,
        contacts,
        shippingConstructors,
        brandShippingMethods,
        about,
        refundPolicy,
        image,
        brandPage,
        allShippingConstructors,
        merchantFieldsCatalog,
        customerFieldsCatalog,
        menu,
        menuCollections,
        menuCategories,
        menuMaxDepth,
        information,
        informationMaxLength,
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
                        information={information ?? ''}
                        informationMaxLength={informationMaxLength ?? 5000}
                    />
                ) : (
                    <ManagerSettings
                        addresses={addresses}
                        contacts={contacts}
                        shippingConstructors={shippingConstructors}
                        brandShippingMethods={brandShippingMethods}
                        about={about}
                        refundPolicy={refundPolicy}
                        image={image ?? null}
                        brandPage={brandPage ?? null}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
