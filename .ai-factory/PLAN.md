# Implementation Plan: Fix SaveBar false-positive on product page

Branch: main
Created: 2026-02-22

## Settings
- Testing: no
- Logging: minimal (dev-only console.log)

## Root Cause

In `rich-text-editor.tsx`, the `setContent` call has wrong API:
```typescript
editor.commands.setContent(value, { emitUpdate: false }); // WRONG
```
TipTap's signature: `setContent(content, emitUpdate?: boolean)`.
Passing an object is truthy → `emitUpdate = true` → `onUpdate` fires on programmatic updates → `onChange` → `markDirty()` → SaveBar appears.

Trigger scenario: product with `description = "<p></p>"` (TipTap empty state stored in DB):
- `value = "<p></p>"`, `editor.isEmpty = true` → `editorHTML = ""`
- `"<p></p>" !== ""` → `setContent` called → update emitted → dirty!

## Tasks

### Phase 1: Fix
- [x] Task 1: Fix `setContent` API call and add initialization guard in `rich-text-editor.tsx`

## Commit
Single commit after fix: `fix: prevent SaveBar from appearing on product page load`
