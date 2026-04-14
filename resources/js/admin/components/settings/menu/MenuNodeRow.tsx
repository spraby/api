import type {CSSProperties} from 'react';

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {ChevronDownIcon, ChevronRightIcon, GripVerticalIcon, PlusIcon, Trash2Icon} from 'lucide-react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {useLang} from '@/lib/lang';
import {cn} from '@/lib/utils';

import RefCombobox from './RefCombobox';

import type {MenuNode, MenuOption, MenuRefType, Path} from './types';

interface MenuNodeRowProps {
    node: MenuNode;
    path: Path;
    depth: number;
    maxDepth: number;
    collapsed: boolean;
    onToggle: (path: Path) => void;
    onChange: (path: Path, patch: Partial<MenuNode>) => void;
    onDelete: (path: Path) => void;
    onAddChild: (path: Path) => void;
    collections: MenuOption[];
    categories: MenuOption[];
    errors: Record<string, string>;
}

function fieldKey(path: Path, field: string): string {
    return `menu.${path.join('.children.')}.${field}`;
}

export default function MenuNodeRow({
    node,
    path,
    depth,
    maxDepth,
    collapsed,
    onToggle,
    onChange,
    onDelete,
    onAddChild,
    collections,
    categories,
    errors,
}: MenuNodeRowProps) {
    const {t} = useLang();
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: String(node.id)});

    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const hasChildren = !!node.children && node.children.length > 0;
    const canAddChild = depth < maxDepth;
    const inferType = (): MenuRefType => {
        if (node.ref_type) {return node.ref_type;}
        if (node.url.startsWith('/collections/')) {return 'collection';}
        if (node.url.startsWith('/categories/')) {return 'category';}

        return 'custom';
    };
    const refType: MenuRefType = inferType();

    const inferRefId = (): number | undefined => {
        if (node.ref_id) {return node.ref_id;}
        if (refType === 'collection') {return collections.find((o) => o.url === node.url)?.id;}
        if (refType === 'category') {return categories.find((o) => o.url === node.url)?.id;}

        return undefined;
    };
    const inferredRefId = inferRefId();

    const handleRefType = (value: MenuRefType) => {
        if (value === 'custom') {
            onChange(path, {ref_type: 'custom', ref_id: undefined});
        } else {
            onChange(path, {ref_type: value, ref_id: undefined, url: ''});
        }
    };

    const titleErr = errors[fieldKey(path, 'title')];
    const urlErr = errors[fieldKey(path, 'url')];

    return (
        <div ref={setNodeRef} style={style} className="group">
            <div className={cn(
                'flex items-start gap-2 rounded-md border bg-card p-2 shadow-sm',
                isDragging && 'ring-2 ring-primary'
            )}>
                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    className="flex h-8 w-6 shrink-0 cursor-grab items-center justify-center text-muted-foreground hover:text-foreground active:cursor-grabbing"
                    aria-label="drag"
                >
                    <GripVerticalIcon className="size-4"/>
                </button>

                <button
                    type="button"
                    onClick={() => onToggle(path)}
                    disabled={!hasChildren}
                    className={cn(
                        'flex h-8 w-6 shrink-0 items-center justify-center text-muted-foreground hover:text-foreground',
                        !hasChildren && 'invisible'
                    )}
                    aria-label={collapsed ? t('admin.settings_menu.actions.expand') : t('admin.settings_menu.actions.collapse')}
                >
                    {collapsed ? <ChevronRightIcon className="size-4"/> : <ChevronDownIcon className="size-4"/>}
                </button>

                <div className="grid flex-1 min-w-0 gap-2 sm:grid-cols-[1fr_140px_1fr]">
                    <div className="flex flex-col gap-1 min-w-0">
                        <Input
                            value={node.title}
                            onChange={(e) => onChange(path, {title: e.target.value})}
                            placeholder={t('admin.settings_menu.placeholders.title')}
                            className={cn('h-8', titleErr && 'border-destructive')}
                        />
                        {titleErr ? <p className="text-xs text-destructive">{titleErr}</p> : null}
                    </div>

                    <Select value={refType} onValueChange={(v) => handleRefType(v as MenuRefType)}>
                        <SelectTrigger className="h-8">
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="collection">{t('admin.settings_menu.link_types.collection')}</SelectItem>
                            <SelectItem value="category">{t('admin.settings_menu.link_types.category')}</SelectItem>
                            <SelectItem value="custom">{t('admin.settings_menu.link_types.custom')}</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex flex-col gap-1 min-w-0">
                        {refType === 'custom' ? (
                            <Input
                                value={node.url}
                                onChange={(e) => onChange(path, {url: e.target.value})}
                                placeholder={t('admin.settings_menu.placeholders.url')}
                                className={cn('h-8', urlErr && 'border-destructive')}
                            />
                        ) : (
                            <RefCombobox
                                options={refType === 'collection' ? collections : categories}
                                value={inferredRefId}
                                onChange={(option) => onChange(path, {
                                    ref_id: option.id,
                                    url: option.url,
                                    title: node.title.trim() === '' ? option.title : node.title,
                                })}
                                placeholder={
                                    refType === 'collection'
                                        ? t('admin.settings_menu.placeholders.pick_collection')
                                        : t('admin.settings_menu.placeholders.pick_category')
                                }
                                hasError={!!urlErr}
                            />
                        )}
                        {urlErr ? <p className="text-xs text-destructive">{urlErr}</p> : null}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                    {canAddChild ? (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            onClick={() => onAddChild(path)}
                            title={t('admin.settings_menu.actions.add_child')}
                        >
                            <PlusIcon className="size-4"/>
                        </Button>
                    ) : null}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-8 text-destructive hover:text-destructive"
                        onClick={() => onDelete(path)}
                        title={t('admin.settings_menu.actions.delete')}
                    >
                        <Trash2Icon className="size-4"/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
