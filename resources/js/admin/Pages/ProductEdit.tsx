import type { FormEventHandler} from 'react';
import { useEffect, useState } from 'react';

import { router } from '@inertiajs/react';
import { ArrowLeftIcon, ImageIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories } from '@/lib/hooks/api/useCategories';
import { useProduct } from '@/lib/hooks/api/useProducts';
import { useUpdateProduct } from '@/lib/hooks/mutations/useProductMutations';
import { useLang } from '@/lib/lang';
import type { Variant } from '@/types/api';

import AdminLayout from '../layouts/AdminLayout';

interface ProductEditProps {
  productId: number;
}

export default function ProductEdit({ productId }: ProductEditProps) {
  const { t } = useLang();

  // API Hooks
  const { data: product, isLoading, error } = useProduct(productId);
  const { data: categories = [] } = useCategories(product?.brand_id, {
    enabled: !!product?.brand_id,
  });
  const updateProduct = useUpdateProduct();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    final_price: '',
    enabled: true,
    category_id: null as number | null,
  });

  const [variants, setVariants] = useState<Variant[]>([
    { title: '', price: '', final_price: '', enabled: true },
  ]);

  // Update form when product data loads
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        description: product.description ?? '',
        price: product.price,
        final_price: product.final_price,
        enabled: product.enabled,
        category_id: product.category_id,
      });

      // Set variants from product or default to one variant
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      }
    }
  }, [product]);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();

    // Ensure at least one variant
    if (variants.length === 0) {
      toast.error(t('admin.products_edit.errors.at_least_one_variant'));

      return;
    }

    updateProduct.mutate(
      {
        id: productId,
        data: {
          ...formData,
          variants,
        },
      },
      {
        onSuccess: () => {
          router.visit('/sb/admin/products');
        },
      }
    );
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        title: '',
        price: formData.price,
        final_price: formData.final_price,
        enabled: true,
      },
    ]);
  };

  const removeVariant = (index: number) => {
    if (variants.length === 1) {
      toast.error(t('admin.products_edit.errors.at_least_one_variant'));

      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | boolean) => {
    const newVariants = [...variants];
    const currentVariant = newVariants[index];

    if (!currentVariant) {return;}

    newVariants[index] = { ...currentVariant, [field]: value };
    setVariants(newVariants);
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout title={t('admin.products_edit.title')}>
        <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout title={t('admin.products_edit.title')}>
        <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
          <Alert variant="destructive">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
          <Button variant="outline" onClick={() => { router.visit('/sb/admin/products'); }}>
            <ArrowLeftIcon className="mr-2 size-4" />
            {t('admin.products_edit.actions.back')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.products_edit.title')}>
      <div className="@container/main flex flex-1 flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                className="size-8"
                size="icon"
                variant="ghost"
                onClick={() => { router.visit('/sb/admin/products'); }}
              >
                <ArrowLeftIcon className="size-4" />
              </Button>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {t('admin.products_edit.title')}
              </h1>
            </div>
            <p className="pl-10 text-sm text-muted-foreground">
              {t('admin.products_edit.description')}
            </p>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Product Information */}
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('admin.products_edit.sections.product_info')}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="flex items-center gap-1" htmlFor="title">
                  {t('admin.products_edit.fields.title')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  disabled={updateProduct.isPending}
                  id="title"
                  placeholder={t('admin.products_edit.placeholders.title')}
                  type="text"
                  value={formData.title}
                  onChange={(e) => { setFormData({ ...formData, title: e.target.value }); }}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">{t('admin.products_edit.fields.description')}</Label>
                <RichTextEditor
                  disabled={updateProduct.isPending}
                  placeholder={t('admin.products_edit.placeholders.description')}
                  value={formData.description}
                  onChange={(value) => { setFormData({ ...formData, description: value }); }}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="category">{t('admin.products_edit.fields.category')}</Label>
                <Select
                  disabled={updateProduct.isPending}
                  value={formData.category_id?.toString() ?? 'none'}
                  onValueChange={(value) => {
                    // Ignore empty string values (happens when Select can't find the option)
                    if (value === '') {
                      return;
                    }
                    setFormData({ ...formData, category_id: value === 'none' ? null : Number(value) });
                  }}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder={t('admin.products_edit.placeholders.category')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('admin.products_edit.category.none')}</SelectItem>
                    {/* Show product's category even if it's not in the brand's categories list */}
                    {product?.category && !categories.find(c => c.id === product.category_id) ? (
                      <SelectItem key={product.category.id} value={product.category.id.toString()}>
                        {product.category.name}
                      </SelectItem>
                    ) : null}
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1" htmlFor="price">
                  {t('admin.products_edit.fields.price')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  disabled={updateProduct.isPending}
                  id="price"
                  min="0"
                  placeholder={t('admin.products_edit.placeholders.price')}
                  step="0.01"
                  type="number"
                  value={formData.price}
                  onChange={(e) => { setFormData({ ...formData, price: e.target.value }); }}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1" htmlFor="final_price">
                  {t('admin.products_edit.fields.final_price')}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  required
                  disabled={updateProduct.isPending}
                  id="final_price"
                  min="0"
                  placeholder={t('admin.products_edit.placeholders.final_price')}
                  step="0.01"
                  type="number"
                  value={formData.final_price}
                  onChange={(e) => { setFormData({ ...formData, final_price: e.target.value }); }}
                />
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <Checkbox
                  checked={formData.enabled}
                  disabled={updateProduct.isPending}
                  id="enabled"
                  onCheckedChange={(checked) =>
                    { setFormData({ ...formData, enabled: checked as boolean }); }
                  }
                />
                <Label className="cursor-pointer" htmlFor="enabled">
                  {t('admin.products_edit.fields.enabled')}
                </Label>
              </div>
            </div>
          </div>

          {/* Product Images Section */}
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold">{t('admin.products_edit.sections.product_images')}</h2>

            {product?.images && product.images.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {product.images.map((productImage, index) => (
                  <Card key={productImage.id}>
                    <CardContent className="p-3">
                      {productImage.url ? (
                        <img
                          alt={`${product.title} - ${index + 1}`}
                          className="h-32 w-full rounded-md border object-cover"
                          src={productImage.url}
                        />
                      ) : (
                        <div className="flex h-32 items-center justify-center rounded-md border bg-muted">
                          <ImageIcon className="size-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Position: {productImage.position}
                        </span>
                        {index === 0 && (
                          <Badge className="text-xs" variant="secondary">Main</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                <ImageIcon className="mb-2 size-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {t('admin.products_edit.no_images')}
                </p>
              </div>
            )}
          </div>

          {/* Variants Section */}
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t('admin.products_edit.sections.variants')}</h2>
              <Button
                disabled={updateProduct.isPending}
                size="sm"
                type="button"
                variant="outline"
                onClick={addVariant}
              >
                <PlusIcon className="size-4" />
                {t('admin.products_edit.actions.add_variant')}
              </Button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="rounded-lg border bg-muted/50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">
                      {t('admin.products_edit.variant')} #{index + 1}
                    </h3>
                    {variants.length > 1 && (
                      <Button
                        className="text-destructive hover:text-destructive"
                        disabled={updateProduct.isPending}
                        size="sm"
                        type="button"
                        variant="ghost"
                        onClick={() => { removeVariant(index); }}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor={`variant-title-${index}`}>
                        {t('admin.products_edit.fields.variant_title')}
                      </Label>
                      <Input
                        disabled={updateProduct.isPending}
                        id={`variant-title-${index}`}
                        placeholder={t('admin.products_edit.placeholders.variant_title')}
                        type="text"
                        value={variant.title ?? ''}
                        onChange={(e) => { updateVariant(index, 'title', e.target.value); }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1" htmlFor={`variant-price-${index}`}>
                        {t('admin.products_edit.fields.price')}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        disabled={updateProduct.isPending}
                        id={`variant-price-${index}`}
                        min="0"
                        placeholder={t('admin.products_edit.placeholders.price')}
                        step="0.01"
                        type="number"
                        value={variant.price}
                        onChange={(e) => { updateVariant(index, 'price', e.target.value); }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-1" htmlFor={`variant-final-price-${index}`}>
                        {t('admin.products_edit.fields.final_price')}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        required
                        disabled={updateProduct.isPending}
                        id={`variant-final-price-${index}`}
                        min="0"
                        placeholder={t('admin.products_edit.placeholders.final_price')}
                        step="0.01"
                        type="number"
                        value={variant.final_price}
                        onChange={(e) => { updateVariant(index, 'final_price', e.target.value); }}
                      />
                    </div>

                    <div className="flex items-center gap-2 sm:col-span-3">
                      <Checkbox
                        checked={variant.enabled}
                        disabled={updateProduct.isPending}
                        id={`variant-enabled-${index}`}
                        onCheckedChange={(checked) =>
                          { updateVariant(index, 'enabled', checked as boolean); }
                        }
                      />
                      <Label className="cursor-pointer" htmlFor={`variant-enabled-${index}`}>
                        {t('admin.products_edit.fields.variant_enabled')}
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="text-destructive">*</span> {t('admin.products_edit.required_fields')}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                disabled={updateProduct.isPending}
                type="button"
                variant="outline"
                onClick={() => { router.visit('/sb/admin/products'); }}
              >
                {t('admin.products_edit.actions.cancel')}
              </Button>
              <Button disabled={updateProduct.isPending} type="submit">
                {updateProduct.isPending
                  ? t('admin.products_edit.actions.saving')
                  : t('admin.products_edit.actions.save')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
