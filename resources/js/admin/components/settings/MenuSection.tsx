import {useMemo, useState} from 'react';

import {
    closestCenter,
    DndContext,
    type DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {restrictToVerticalAxis} from '@dnd-kit/modifiers';
import {SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {router} from '@inertiajs/react';
import {PlusIcon} from 'lucide-react';
import {toast} from 'sonner';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {useLang} from '@/lib/lang';

import MenuNodeRow from './menu/MenuNodeRow';
import {
    collectIdsWithChildren,
    insertAt,
    makeNewNode,
    normalize,
    removeAt,
    reorderChildren,
    updateAt,
} from './menu/tree';

import type {MenuNode, MenuOption, Path} from './menu/types';

interface MenuSectionProps {
    menu: MenuNode[];
    collections: MenuOption[];
    categories: MenuOption[];
    maxDepth: number;
}

interface PathEntry {
    node: MenuNode;
    path: Path;
    parentKey: string;
}

function collectPaths(
    nodes: MenuNode[],
    parentPath: Path,
    parentKey: string,
    acc: Map<string, PathEntry>,
): void {
    nodes.forEach((node, i) => {
        const path = [...parentPath, i];

        acc.set(String(node.id), {node, path, parentKey});
        if (node.children?.length) {
            collectPaths(node.children, path, String(node.id), acc);
        }
    });
}

export default function MenuSection({menu, collections, categories, maxDepth}: MenuSectionProps) {
    const {t} = useLang();
    const [tree, setTree] = useState<MenuNode[]>(() => normalize(menu));
    const [collapsed, setCollapsed] = useState<Set<string>>(() => collectIdsWithChildren(normalize(menu)));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const pathIndex = useMemo(() => {
        const map = new Map<string, PathEntry>();

        collectPaths(tree, [], 'root', map);

        return map;
    }, [tree]);

    const sensors = useSensors(
        useSensor(PointerSensor, {activationConstraint: {distance: 5}}),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates}),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const {active, over} = event;

        if (!over || active.id === over.id) {return;}
        const from = pathIndex.get(String(active.id));
        const to = pathIndex.get(String(over.id));

        if (!from || !to || from.parentKey !== to.parentKey) {return;}

        const parentPath = from.path.slice(0, -1);
        const fromIdx = from.path[from.path.length - 1];
        const toIdx = to.path[to.path.length - 1];

        setTree((prev) => reorderChildren(prev, parentPath, fromIdx, toIdx));
    };

    const toggleCollapse = (path: Path) => {
        const id = String((pathLookup(tree, path))?.id ?? '');

        if (!id) {return;}
        setCollapsed((prev) => {
            const next = new Set(prev);

            if (next.has(id)) {next.delete(id);}
            else {next.add(id);}

            return next;
        });
    };

    const handleChange = (path: Path, patch: Partial<MenuNode>) => {
        setTree((prev) => updateAt(prev, path, (n) => ({...n, ...patch})));
    };

    const handleDelete = (path: Path) => {
        setTree((prev) => removeAt(prev, path));
    };

    const handleAddChild = (parentPath: Path) => {
        setTree((prev) => {
            const parent = pathLookup(prev, parentPath);
            const index = parent?.children?.length ?? 0;

            return insertAt(prev, parentPath, index, makeNewNode());
        });
    };

    const handleAddRoot = () => {
        setTree((prev) => insertAt(prev, [], prev.length, makeNewNode()));
    };

    const handleSave = () => {
        setProcessing(true);
        setErrors({});
        router.put(route('admin.settings.menu.update'), {menu: serializeTree(tree)} as never, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(t('admin.settings_menu.messages.updated'));
            },
            onError: (errs) => {
                setErrors(errs as Record<string, string>);
                toast.error(Object.values(errs)[0] ?? 'Ошибка сохранения');
            },
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('admin.settings_menu.title')}</CardTitle>
                <CardDescription>{t('admin.settings_menu.description')}</CardDescription>
            </CardHeader>
            <CardContent>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleDragEnd}
                >
                    {tree.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">
                            {t('admin.settings_menu.empty')}
                        </p>
                    ) : (
                        <MenuList
                            nodes={tree}
                            parentPath={[]}
                            depth={1}
                            maxDepth={maxDepth}
                            collapsed={collapsed}
                            onToggle={toggleCollapse}
                            onChange={handleChange}
                            onDelete={handleDelete}
                            onAddChild={handleAddChild}
                            collections={collections}
                            categories={categories}
                            errors={errors}
                        />
                    )}

                    <div className="mt-4 flex items-center justify-between">
                        <Button type="button" variant="outline" onClick={handleAddRoot}>
                            <PlusIcon className="mr-1 size-4"/>
                            {t('admin.settings_menu.actions.add_root')}
                        </Button>
                        <Button type="button" onClick={handleSave} disabled={processing}>
                            {processing
                                ? t('admin.settings_menu.actions.saving')
                                : t('admin.settings_menu.actions.save')}
                        </Button>
                    </div>
                </DndContext>
            </CardContent>
        </Card>
    );
}

interface MenuListProps {
    nodes: MenuNode[];
    parentPath: Path;
    depth: number;
    maxDepth: number;
    collapsed: Set<string>;
    onToggle: (path: Path) => void;
    onChange: (path: Path, patch: Partial<MenuNode>) => void;
    onDelete: (path: Path) => void;
    onAddChild: (path: Path) => void;
    collections: MenuOption[];
    categories: MenuOption[];
    errors: Record<string, string>;
}

function MenuList({
    nodes,
    parentPath,
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
}: MenuListProps) {
    const items = nodes.map((n) => String(n.id));

    return (
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-1.5">
                {nodes.map((node, i) => {
                    const path = [...parentPath, i];
                    const isCollapsed = collapsed.has(String(node.id));

                    return (
                        <div key={String(node.id)} className="flex flex-col gap-1.5">
                            <MenuNodeRow
                                node={node}
                                path={path}
                                depth={depth}
                                maxDepth={maxDepth}
                                collapsed={isCollapsed}
                                onToggle={onToggle}
                                onChange={onChange}
                                onDelete={onDelete}
                                onAddChild={onAddChild}
                                collections={collections}
                                categories={categories}
                                errors={errors}
                            />
                            {node.children?.length && !isCollapsed ? (
                                <div className="ml-8 border-l border-dashed pl-3">
                                    <MenuList
                                        nodes={node.children}
                                        parentPath={path}
                                        depth={depth + 1}
                                        maxDepth={maxDepth}
                                        collapsed={collapsed}
                                        onToggle={onToggle}
                                        onChange={onChange}
                                        onDelete={onDelete}
                                        onAddChild={onAddChild}
                                        collections={collections}
                                        categories={categories}
                                        errors={errors}
                                    />
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </SortableContext>
    );
}

function pathLookup(nodes: MenuNode[], path: Path): MenuNode | undefined {
    if (path.length === 0) {return undefined;}
    let cur: MenuNode | undefined = nodes[path[0]];

    for (let i = 1; i < path.length; i++) {
        if (!cur?.children) {return undefined;}
        cur = cur.children[path[i]];
    }

    return cur;
}

function serializeTree(nodes: MenuNode[]): Record<string, unknown>[] {
    return nodes.map((n) => {
        const out: Record<string, unknown> = {
            title: n.title,
            url: n.url,
        };

        if (typeof n.id === 'number') {out.id = n.id;}
        if (n.ref_type) {out.ref_type = n.ref_type;}
        if (typeof n.ref_id === 'number') {out.ref_id = n.ref_id;}
        if (n.children?.length) {out.children = serializeTree(n.children);}

        return out;
    });
}
