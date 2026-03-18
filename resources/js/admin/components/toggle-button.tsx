import {cn} from "@/lib/utils.ts";

/**
 *
 * @param onClick
 * @param active
 * @param title
 * @constructor
 */
export const ToggleButton = ({onClick, active, title}: { onClick: any, active: boolean, title: string }) => {
    return <button
        type="button"
        onClick={onClick}
        className={cn(
            'rounded-lg border px-3 py-1.5 text-sm transition-colors',
            active
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground',
        )}
    >
        {title}
    </button>
}
