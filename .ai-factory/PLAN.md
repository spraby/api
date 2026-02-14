# Implementation Plan: Create Product with Images and Variants in One Request

Branch: main
Created: 2026-02-12

## Settings
- Testing: no
- Logging: standard

## Problem

Currently product creation is a **two-step process**:
1. Create product + variants (`POST /admin/products/store`)
2. Upload/attach images **after redirect to edit page** (separate requests)

`ProductImagesManager` is hidden during creation: `{!!formData?.id && ...}`

**Goal:** One form submission creates product + uploads/attaches images + creates variants with image assignments.

## Architecture Decision

### Variant-to-Image Mapping Challenge

During creation, `ProductImage` records don't exist yet, so variants can't reference `ProductImage.id`.

**Solution: `image_index` mapping**
- Staged images get ordered indices (0, 1, 2, ...)
- Variants reference images by `image_index` (position in the images array)
- Backend creates ProductImage records first, maps `image_index` -> `ProductImage.id`, then creates variants

### Data Flow (Create Mode)

```
Frontend:
  stagedImages: [{ file: File1 }, { imageId: 42 }, { file: File2 }]
  variants: [{ ..., image_index: 0 }, { ..., image_index: 1 }]

  -> POST multipart:
    images[]: [File1, File2]
    existing_image_ids[]: [42]
    image_order[]: ['upload:0', 'existing:0', 'upload:1']  // preserves mixed ordering
    variants[0][image_index]: 0  // -> first in image_order -> upload:0 -> File1
    variants[1][image_index]: 1  // -> second in image_order -> existing:0 -> Image#42

Backend (in transaction):
  1. Create Product
  2. Process image_order:
     - 'upload:0' -> upload File1 to S3 -> Image + ProductImage (position 1)
     - 'existing:0' -> attach Image#42 -> ProductImage (position 2)
     - 'upload:1' -> upload File2 to S3 -> Image + ProductImage (position 3)
  3. Map: index 0 -> ProductImage#A, index 1 -> ProductImage#B, index 2 -> ProductImage#C
  4. Create variants: image_index 0 -> ProductImage#A.id, image_index 1 -> ProductImage#B.id
```

## Commit Plan
- **Commit 1** (after tasks 1-3): "feat: backend support for images in product creation"
- **Commit 2** (after tasks 4-6): "feat: frontend staged images and create-mode image management"
- **Commit 3** (after task 7): "feat: variant image selection from staged images during creation"

## Tasks

### Phase 1: Backend -- Accept Images in Store Request

- [x] Task 1: Update StoreProductRequest validation
  - File: `app/Http/Requests/StoreProductRequest.php` (or `ProductValidationRules` trait)
  - Add rules:
    - `images`: `nullable|array|max:50`
    - `images.*`: `image|max:10240`
    - `existing_image_ids`: `nullable|array`
    - `existing_image_ids.*`: `integer|exists:images,id`
    - `image_order`: `nullable|array` (preserves mixed upload/existing ordering)
    - `image_order.*`: `string` (format: `upload:N` or `existing:N`)
    - `variants.*.image_index`: `nullable|integer|min:0`
  - Logging: log validation failures for image fields

- [x] Task 2: Update ProductController::store() to process images
  - File: `app/Http/Controllers/Admin/ProductController.php`
  - Wrap in `DB::transaction()`
  - After product creation, before variants:
    1. Parse `image_order` to determine processing sequence
    2. For `upload:N` entries: upload file via `FileService` -> create `Image` -> create `ProductImage`
    3. For `existing:N` entries: verify Image belongs to brand -> create `ProductImage`
    4. Build mapping: `image_order index -> ProductImage.id`
    5. Inject `image_id` into each variant's data based on `image_index`
    6. Pass enriched variants to `VariantService::createVariants()`
  - Logging: log image processing count, S3 upload results, mapping table

- [x] Task 3: Update VariantService to handle image_index cleanup
  - File: `app/Services/VariantService.php`
  - Ensure `createVariants()` strips `image_index` field before mass-assignment
  - The controller will have already mapped `image_index` -> `image_id`
  - Logging: log variant creation with image_id when present

<!-- Commit checkpoint: "feat: backend support for images in product creation" -->

### Phase 2: Frontend -- Staged Images Management

- [x] Task 4: Add staged images state to useProductForm
  - File: `resources/js/admin/hooks/use-product-form.ts`
  - Add types:
    ```typescript
    interface StagedImage {
      tempId: string;           // crypto.randomUUID()
      type: 'upload' | 'existing';
      file?: File;              // for uploads
      image?: Image;            // for existing (full Image object for display)
      previewUrl: string;       // blob URL for uploads, image.url for existing
    }
    ```
  - Add state: `stagedImages: StagedImage[]`
  - Add functions: `addStagedUploads(files: File[])`, `addStagedExisting(images: Image[])`, `removeStagedImage(tempId)`, `reorderStagedImages(tempIds: string[])`
  - Cleanup: revoke blob URLs on unmount and on remove
  - Only active when `!formData.id` (create mode)

- [x] Task 5: Create ProductImagesStaging component
  - File: `resources/js/admin/components/product-images-staging.tsx` (new)
  - Props: `stagedImages`, `onAddUploads`, `onAddExisting`, `onRemove`, `onReorder`, `disabled`
  - UI: grid of staged image thumbnails (same layout as ProductImagesManager)
  - Upload button -> opens `ImagePicker` with `onUpload` handler
  - Attach button -> opens `ImagePicker` with `onSelect` handler (library tab)
  - Remove button per image
  - Drag-to-reorder (same DnD pattern as ProductImagesManager)
  - Empty state when no images staged
  - Use shadcn/ui Card, Button; same styling as ProductImagesManager

- [x] Task 6: Update ProductForm to show images during creation
  - File: `resources/js/admin/components/product-form.tsx`
  - Replace `{!!formData?.id && <Card>...ProductImagesManager...</Card>}` with:
    - If `formData.id` -> show `ProductImagesManager` (existing behavior)
    - If `!formData.id` -> show `ProductImagesStaging` (new component)
  - Pass staged images state and handlers from useProductForm context

<!-- Commit checkpoint: "feat: frontend staged images and create-mode image management" -->

### Phase 3: Variant Image Selection During Creation

- [x] Task 7: Update variant image selection for create mode
  - Files:
    - `resources/js/admin/components/product-variant-list.tsx`
    - `resources/js/admin/hooks/use-product-form.ts`
  - In create mode (`!formData.id`):
    - `ProductImagesPicker` should show staged images instead of server `ProductImage[]`
    - Convert `StagedImage[]` -> mock `ProductImage[]` format for the picker
    - On select: store `image_index` (position in stagedImages array) on variant
    - Update `resolveImageUrl` to check staged images when `formData.id` is absent
  - In edit mode: existing behavior unchanged (uses `ProductImage.id`)
  - Update form submission:
    - Create mode: build `FormData` with:
      - Product fields (title, description, enabled, category_id)
      - `images[]` -- File objects from staged uploads
      - `existing_image_ids[]` -- Image.id values from staged existing images
      - `image_order[]` -- ordered array like `['upload:0', 'existing:0', 'upload:1']`
      - `variants[N][image_index]` -- index into image_order for each variant
    - Use `router.post()` (Inertia auto-converts to multipart when Files present)
    - Edit mode: unchanged (`router.put()` with JSON data)

<!-- Commit checkpoint: "feat: variant image selection from staged images during creation" -->

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `app/Http/Requests/StoreProductRequest.php` | Modify | Add image validation rules |
| `app/Http/Requests/Traits/ProductValidationRules.php` | Modify | Add image_index rule to variants |
| `app/Http/Controllers/Admin/ProductController.php` | Modify | Handle images in store() |
| `app/Services/VariantService.php` | Modify | Strip image_index from data |
| `resources/js/admin/hooks/use-product-form.ts` | Modify | Add staged images state, update submission |
| `resources/js/admin/components/product-images-staging.tsx` | **Create** | New component for create-mode images |
| `resources/js/admin/components/product-form.tsx` | Modify | Show staging component in create mode |
| `resources/js/admin/components/product-variant-list.tsx` | Modify | Handle staged images for variant picker |
| `resources/js/admin/types/models.ts` | Modify | Add StagedImage type |

## Edge Cases

1. **No images** -- Product creation works exactly as before (backward compatible)
2. **Images but no variant image assignments** -- Images uploaded, variants have no image_id
3. **Variant references removed image** -- If user removes a staged image that a variant references, clear that variant's image_index
4. **Reordering staged images** -- Update variant image_index references when images are reordered
5. **Mixed uploads + existing** -- image_order preserves correct sequence
6. **Upload failure** -- Transaction rollback: no product, no images, no variants created
7. **Large files** -- Existing 10MB limit per image, 50 images max
