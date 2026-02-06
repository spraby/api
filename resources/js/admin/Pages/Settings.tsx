import {useState} from 'react';

import {usePage} from '@inertiajs/react';
import {Building2Icon, MapPinIcon, TruckIcon, PhoneIcon} from 'lucide-react';

import AddressesSection from '@/components/settings/AddressesSection';
import ContactsSection from '@/components/settings/ContactsSection';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import AdminLayout from '@/layouts/AdminLayout';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';
import type {Address, ContactsMap} from '@/types/api';
import type {PageProps} from '@/types/inertia';

const tabs = [
    {id: 'general', icon: Building2Icon, label_ru: 'Основные', label_en: 'General'},
    {id: 'addresses', icon: MapPinIcon, label_ru: 'Адреса', label_en: 'Addresses'},
    {id: 'delivery', icon: TruckIcon, label_ru: 'Доставка', label_en: 'Delivery'},
    {id: 'contacts', icon: PhoneIcon, label_ru: 'Контакты', label_en: 'Contacts'},
] as const;

type TabId = (typeof tabs)[number]['id'];

function GeneralSection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Основные настройки</CardTitle>
                <CardDescription>Общая информация о вашем магазине</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Здесь будут основные настройки...</p>
            </CardContent>
        </Card>
    );
}

function DeliverySection() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Доставка</CardTitle>
                <CardDescription>Настройки способов доставки</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Здесь будут настройки доставки...</p>
            </CardContent>
        </Card>
    );
}

function ManagerSettings({
    addresses,
    contacts,
    locale,
}: {
    addresses: Address[];
    contacts: ContactsMap;
    locale: string;
}) {
    const [activeTab, setActiveTab] = useState<TabId>('general');

    return (
        <div className="flex flex-1 gap-6">
            <nav className="w-48 shrink-0 flex flex-col gap-1">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const label = locale === 'ru' ? tab.label_ru : tab.label_en;

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors text-left',
                                activeTab === tab.id
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                            )}
                        >
                            <Icon className="size-4 shrink-0"/>
                            {label}
                        </button>
                    );
                })}
            </nav>

            <div className="flex-1 min-w-0">
                {activeTab === 'general' && <GeneralSection/>}
                {activeTab === 'addresses' && <AddressesSection addresses={addresses}/>}
                {activeTab === 'delivery' && <DeliverySection/>}
                {activeTab === 'contacts' && <ContactsSection contacts={contacts}/>}
            </div>
        </div>
    );
}

function AdminSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Platform-wide settings will be here</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Coming soon...</p>
            </CardContent>
        </Card>
    );
}

export default function Settings() {
    const {t, locale} = useLang();
    const {auth, addresses, contacts} = usePage<PageProps<{addresses: Address[]; contacts: ContactsMap}>>().props;

    return (
        <AdminLayout title={t('admin.nav.settings')}>
            <div className="flex flex-1 flex-col gap-4">
                <h1 className="text-2xl font-semibold">{t('admin.nav.settings')}</h1>
                <Separator/>

                {auth.user.is_admin ? (
                    <AdminSettings/>
                ) : (
                    <ManagerSettings addresses={addresses} contacts={contacts} locale={locale}/>
                )}
            </div>
        </AdminLayout>
    );
}
