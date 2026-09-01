import {usePage} from '@inertiajs/react';
import {Building2Icon, MapPinIcon, MenuIcon, PhoneIcon, TruckIcon} from 'lucide-react';

import AddressesSection from '@/components/settings/AddressesSection';
import ContactsSection from '@/components/settings/ContactsSection';
import DeliverySection from '@/components/settings/DeliverySection';
import GeneralSection from '@/components/settings/GeneralSection';
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

interface SettingsPageProps extends Record<string, unknown> {
    addresses: Address[];
    contacts: ContactsMap;
    shippingConstructors: ShippingConstructorOption[];
    brandShippingMethods: BrandShippingMethod[];
    about: string;
    refundPolicy: string;
    image: BrandImage | null;
    allShippingConstructors?: ShippingMethodConstructor[];
    merchantFieldsCatalog?: ShippingFieldDef[];
    customerFieldsCatalog?: ShippingFieldDef[];
    menu?: MenuNode[];
    menuCollections?: MenuOption[];
    menuCategories?: MenuOption[];
    menuMaxDepth?: number;
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
}: {
    addresses: Address[];
    contacts: ContactsMap;
    shippingConstructors: ShippingConstructorOption[];
    brandShippingMethods: BrandShippingMethod[];
    about: string;
    refundPolicy: string;
    image: BrandImage | null;
}) {
    return (
        <SettingsTabs defaultTab="general" tabs={tabs}>
            <SettingsTabsPanel value="general">
                <GeneralSection about={about} refundPolicy={refundPolicy} image={image}/>
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
] as const;

function AdminSettings({
    menu,
    collections,
    categories,
    maxDepth,
    constructors,
    merchantCatalog,
    customerCatalog,
}: {
    menu: MenuNode[];
    collections: MenuOption[];
    categories: MenuOption[];
    maxDepth: number;
    constructors: ShippingMethodConstructor[];
    merchantCatalog: ShippingFieldDef[];
    customerCatalog: ShippingFieldDef[];
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
                    />
                )}
            </div>
        </AdminLayout>
    );
}
