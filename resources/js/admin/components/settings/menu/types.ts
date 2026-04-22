export type MenuRefType = 'collection' | 'category' | 'custom';

export interface MenuNode {
    id: number | string;
    title: string;
    url: string;
    ref_type?: MenuRefType;
    ref_id?: number;
    children?: MenuNode[];
}

export interface MenuOption {
    id: number;
    name?: string;
    title: string;
    url: string;
}

export type Path = number[];
