import {useEffect, useMemo, useRef, useState} from 'react';

import {CheckIcon, ChevronsUpDownIcon, SearchIcon} from 'lucide-react';

import {Input} from '@/components/ui/input';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {cn} from '@/lib/utils';

import type {MenuOption} from './types';

interface RefComboboxProps {
    options: MenuOption[];
    value: number | undefined;
    onChange: (option: MenuOption) => void;
    placeholder: string;
    searchPlaceholder?: string;
    emptyText?: string;
    hasError?: boolean;
}

export default function RefCombobox({
    options,
    value,
    onChange,
    placeholder,
    searchPlaceholder = 'Поиск...',
    emptyText = 'Ничего не найдено',
    hasError,
}: RefComboboxProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [highlight, setHighlight] = useState(0);
    const listRef = useRef<HTMLDivElement>(null);

    const selected = useMemo(
        () => options.find((o) => o.id === value),
        [options, value],
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        if (!q) {return options;}

        return options.filter(
            (o) => {
                const name = o.name?.toLowerCase() ?? '';

                return name.includes(q) || o.title.toLowerCase().includes(q);
            },
        );
    }, [options, query]);

    useEffect(() => {
        if (!open) {
            setQuery('');
            setHighlight(0);
        }
    }, [open]);

    useEffect(() => {
        setHighlight(0);
    }, [query]);

    useEffect(() => {
        const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${highlight}"]`);

        node?.scrollIntoView({block: 'nearest'});
    }, [highlight]);

    const handleSelect = (option: MenuOption) => {
        onChange(option);
        setOpen(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const picked = filtered[highlight];

            if (picked) {handleSelect(picked);}
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    className={cn(
                        'flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none',
                        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        hasError && 'border-destructive',
                    )}
                >
                    <span className={cn('truncate text-left', !selected && 'text-muted-foreground')}>
                        {(selected?.name ?? selected?.title) ?? placeholder}
                    </span>
                    <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground"/>
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-[var(--radix-popover-trigger-width)] min-w-[220px] p-0"
                onOpenAutoFocus={(e) => {
                    // allow the search input inside to take focus naturally
                    e.preventDefault();
                }}
            >
                <div className="flex items-center gap-2 border-b px-3 py-2">
                    <SearchIcon className="size-4 shrink-0 text-muted-foreground"/>
                    <Input
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={searchPlaceholder}
                        className="h-7 border-0 p-0 shadow-none focus-visible:ring-0"
                    />
                </div>
                <div ref={listRef} className="max-h-64 overflow-y-auto py-1">
                    {filtered.length === 0 ? (
                        <div className="px-3 py-4 text-center text-sm text-muted-foreground">{emptyText}</div>
                    ) : (
                        filtered.map((option, index) => {
                            const isSelected = option.id === value;
                            const isActive = index === highlight;
                            const displayName = option.name ?? option.title;
                            const displayTitle = option.title;

                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    data-index={index}
                                    onMouseEnter={() => setHighlight(index)}
                                    onClick={() => handleSelect(option)}
                                    className={cn(
                                        'flex w-full items-start gap-2 px-3 py-2 text-left text-sm outline-none',
                                        isActive && 'bg-accent text-accent-foreground',
                                    )}
                                >
                                    <CheckIcon
                                        className={cn('mt-0.5 size-4 shrink-0', isSelected ? 'opacity-100' : 'opacity-0')}
                                    />
                                    <span className="min-w-0 flex-1">
                                        <span className="block truncate font-medium">{displayName}</span>
                                        <span className="block truncate text-xs text-muted-foreground">{displayTitle}</span>
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
