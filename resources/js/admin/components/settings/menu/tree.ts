import type {MenuNode, Path} from './types';

export function normalize(nodes: MenuNode[]): MenuNode[] {
    return nodes.map((n) => ({
        ...n,
        children: n.children?.length ? normalize(n.children) : [],
    }));
}

export function depthOf(nodes: MenuNode[]): number {
    let max = 1;

    for (const n of nodes) {
        if (n.children?.length) {
            max = Math.max(max, 1 + depthOf(n.children));
        }
    }

    return max;
}

export function getAt(nodes: MenuNode[], path: Path): MenuNode | undefined {
    if (path.length === 0) {return undefined;}
    let current: MenuNode | undefined = nodes[path[0]];

    for (let i = 1; i < path.length; i++) {
        if (!current?.children) {return undefined;}
        current = current.children[path[i]];
    }

    return current;
}

export function updateAt(nodes: MenuNode[], path: Path, updater: (node: MenuNode) => MenuNode): MenuNode[] {
    if (path.length === 0) {return nodes;}
    const [head, ...rest] = path;

    return nodes.map((node, i) => {
        if (i !== head) {return node;}
        if (rest.length === 0) {return updater(node);}

        return {
            ...node,
            children: updateAt(node.children ?? [], rest, updater),
        };
    });
}

export function removeAt(nodes: MenuNode[], path: Path): MenuNode[] {
    if (path.length === 0) {return nodes;}
    const [head, ...rest] = path;

    if (rest.length === 0) {
        return nodes.filter((_, i) => i !== head);
    }

    return nodes.map((node, i) => {
        if (i !== head) {return node;}

        return {
            ...node,
            children: removeAt(node.children ?? [], rest),
        };
    });
}

export function insertAt(nodes: MenuNode[], parentPath: Path, index: number, node: MenuNode): MenuNode[] {
    if (parentPath.length === 0) {
        const next = [...nodes];

        next.splice(index, 0, node);

        return next;
    }
    const [head, ...rest] = parentPath;

    return nodes.map((n, i) => {
        if (i !== head) {return n;}
        const childList = n.children ?? [];

        return {
            ...n,
            children: insertAt(childList, rest, index, node),
        };
    });
}

export function reorder<T>(list: T[], from: number, to: number): T[] {
    const next = [...list];
    const [moved] = next.splice(from, 1);

    next.splice(to, 0, moved);

    return next;
}

export function reorderChildren(nodes: MenuNode[], parentPath: Path, from: number, to: number): MenuNode[] {
    if (parentPath.length === 0) {
        return reorder(nodes, from, to);
    }
    const [head, ...rest] = parentPath;

    return nodes.map((n, i) => {
        if (i !== head) {return n;}

        return {
            ...n,
            children: reorderChildren(n.children ?? [], rest, from, to),
        };
    });
}

let tempCounter = 0;

export function genTempId(): string {
    tempCounter += 1;

    return `new-${Date.now()}-${tempCounter}`;
}

export function collectIdsWithChildren(nodes: MenuNode[], acc = new Set<string>()): Set<string> {
    for (const n of nodes) {
        if (n.children?.length) {
            acc.add(String(n.id));
            collectIdsWithChildren(n.children, acc);
        }
    }

    return acc;
}

export function makeNewNode(): MenuNode {
    return {
        id: genTempId(),
        title: '',
        url: '',
        ref_type: 'category',
        children: [],
    };
}
