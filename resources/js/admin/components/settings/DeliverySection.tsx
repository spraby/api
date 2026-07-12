import {useState} from 'react';

import {router} from '@inertiajs/react';
import {XIcon} from 'lucide-react';
import {toast} from 'sonner';

import {Badge} from '@/components/ui/badge';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Checkbox} from '@/components/ui/checkbox';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useLang} from '@/lib/lang';
import type {BrandShippingMethod, ShippingConstructorOption, ShippingFieldDef} from '@/types/api';

type FieldValues = Record<string, string | string[]>;

interface MethodState {
  enabled: boolean;
  values: FieldValues;
}

function emptyValue(field: ShippingFieldDef): string | string[] {
  return field.type === 'select' ? [] : '';
}

function TagsInput({
  value,
  disabled,
  placeholder,
  onChange,
}: {
  value: string[];
  disabled: boolean;
  placeholder: string;
  onChange: (value: string[]) => void;
}) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();

    if (tag === '' || value.includes(tag)) {
      setInput('');

      return;
    }

    onChange([...value, tag]);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-2">
      {value.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                disabled={disabled}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                onClick={() => onChange(value.filter((item) => item !== tag))}
              >
                <XIcon className="size-3"/>
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      <Input
        value={input}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
          }
        }}
        onBlur={addTag}
      />
    </div>
  );
}

function MethodField({
  methodId,
  field,
  value,
  disabled,
  placeholder,
  onChange,
}: {
  methodId: number;
  field: ShippingFieldDef;
  value: string | string[];
  disabled: boolean;
  placeholder: string;
  onChange: (value: string | string[]) => void;
}) {
  const inputId = `method-${methodId}-${field.key}`;

  const renderControl = () => {
    if (field.type === 'select') {
      return (
        <TagsInput
          value={Array.isArray(value) ? value : []}
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
        />
      );
    }

    if (field.key === 'merchant_notes') {
      return (
        <Textarea
          id={inputId}
          value={typeof value === 'string' ? value : ''}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    }

    return (
      <Input
        id={inputId}
        type={field.type === 'number' ? 'number' : 'text'}
        value={typeof value === 'string' ? value : ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{field.name}</Label>
      {renderControl()}
    </div>
  );
}

export default function DeliverySection({
  constructors,
  brandMethods,
}: {
  constructors: ShippingConstructorOption[];
  brandMethods: BrandShippingMethod[];
}) {
  const {t} = useLang();

  const [methods, setMethods] = useState<Record<number, MethodState>>(() => {
    const state: Record<number, MethodState> = {};

    for (const constructor of constructors) {
      const existing = brandMethods.find((m) => m.constructor_id === constructor.id);
      const values: FieldValues = {};

      for (const field of constructor.merchant_fields) {
        const saved = existing?.merchant_settings.find((f) => f.key === field.key);

        values[field.key] = saved?.value ?? emptyValue(field);
      }

      state[constructor.id] = {enabled: Boolean(existing), values};
    }

    return state;
  });
  const [isSaving, setIsSaving] = useState(false);

  const toggleMethod = (constructorId: number, enabled: boolean) => {
    setMethods((prev) => {
      const current = prev[constructorId];

      return current ? {...prev, [constructorId]: {...current, enabled}} : prev;
    });
  };

  const setValue = (constructorId: number, key: string, value: string | string[]) => {
    setMethods((prev) => {
      const current = prev[constructorId];

      return current
        ? {...prev, [constructorId]: {...current, values: {...current.values, [key]: value}}}
        : prev;
    });
  };

  const handleSave = () => {
    setIsSaving(true);

    router.put(
      route('admin.settings.shipping-methods.sync'),
      {
        methods: constructors.map((constructor) => ({
          constructor_id: constructor.id,
          enabled: methods[constructor.id]?.enabled ?? false,
          values: methods[constructor.id]?.values ?? {},
        })),
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success(t('admin.settings_delivery.messages.updated'));
        },
        onError: (errors: Record<string, string>) => {
          const message = Object.values(errors)[0];

          if (message) {
            toast.error(message);
          }
        },
        onFinish: () => setIsSaving(false),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('admin.settings_delivery.title')}</CardTitle>
        <CardDescription>{t('admin.settings_delivery.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        {constructors.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t('admin.settings_delivery.no_methods')}
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {constructors.map((constructor) => {
              const state = methods[constructor.id];

              if (!state) {
                return null;
              }

              return (
                <div key={constructor.id} className="rounded-lg border p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={`shipping-${constructor.id}`}
                      className="mt-0.5"
                      checked={state.enabled}
                      disabled={isSaving}
                      onCheckedChange={(checked) => toggleMethod(constructor.id, checked === true)}
                    />
                    <div>
                      <Label htmlFor={`shipping-${constructor.id}`} className="cursor-pointer font-medium">
                        {constructor.name}
                      </Label>
                      {constructor.description ? (
                        <p className="text-sm text-muted-foreground">{constructor.description}</p>
                      ) : null}
                    </div>
                  </div>

                  {state.enabled && constructor.merchant_fields.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 gap-4 pl-7 sm:grid-cols-2">
                      {constructor.merchant_fields.map((field) => (
                        <div
                          key={field.key}
                          className={field.type === 'select' || field.key === 'merchant_notes' ? 'sm:col-span-2' : ''}
                        >
                          <MethodField
                            methodId={constructor.id}
                            field={field}
                            value={state.values[field.key] ?? emptyValue(field)}
                            disabled={isSaving}
                            placeholder={t('admin.settings_delivery.select_placeholder')}
                            onChange={(value) => setValue(constructor.id, field.key, value)}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving
                  ? t('admin.settings_delivery.actions.saving')
                  : t('admin.settings_delivery.actions.save')}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
