import type { FormEventHandler } from 'react';

import { useForm } from '@inertiajs/react';
import { AtSignIcon, FacebookIcon, InstagramIcon, MessageCircleIcon, PhoneIcon, SendIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLang } from '@/lib/lang';
import type { ContactsMap, ContactType } from '@/types/api';

const contactTypes: { type: ContactType; icon: typeof PhoneIcon }[] = [
  { type: 'email', icon: AtSignIcon },
  { type: 'phone', icon: PhoneIcon },
  { type: 'whatsapp', icon: MessageCircleIcon },
  { type: 'telegram', icon: SendIcon },
  { type: 'instagram', icon: InstagramIcon },
  { type: 'facebook', icon: FacebookIcon },
];

interface ContactsFormData {
  email: string;
  phone: string;
  whatsapp: string;
  telegram: string;
  instagram: string;
  facebook: string;
}

export default function ContactsSection({ contacts }: { contacts: ContactsMap }) {
  const { t } = useLang();

  const { data, setData, put, processing, errors } = useForm<ContactsFormData>({
    email: contacts.email ?? '',
    phone: contacts.phone ?? '',
    whatsapp: contacts.whatsapp ?? '',
    telegram: contacts.telegram ?? '',
    instagram: contacts.instagram ?? '',
    facebook: contacts.facebook ?? '',
  });

  const onSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route('admin.settings.contacts.update'), {
      preserveState: true,
      preserveScroll: true,
      onSuccess: () => {
        toast.success(t('admin.settings_contacts.messages.updated'));
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.settings_contacts.title')}</CardTitle>
        <CardDescription>{t('admin.settings_contacts.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {contactTypes.map((item) => {
              const IconComponent = item.icon;

              return (
              <div key={item.type} className="flex flex-col gap-2">
                <Label htmlFor={`contact-${item.type}`} className="flex items-center gap-2">
                  <IconComponent className="size-4 text-muted-foreground" />
                  {t(`admin.settings_contacts.fields.${item.type}`)}
                </Label>
                <Input
                  id={`contact-${item.type}`}
                  value={data[item.type]}
                  onChange={(e) => setData(item.type, e.target.value)}
                  placeholder={t(`admin.settings_contacts.placeholders.${item.type}`)}
                  className={errors[item.type] ? 'border-destructive' : ''}
                />
                {errors[item.type] ? <p className="text-xs text-destructive">{errors[item.type]}</p> : null}
              </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={processing}>
              {processing
                ? t('admin.settings_contacts.actions.saving')
                : t('admin.settings_contacts.actions.save')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
