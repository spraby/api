import {Trash2Icon} from "lucide-react";

export const TrashButton = ({onClick}: { onClick?: () => void }) => {
    return <button
        type="button"
        onClick={onClick}
        className={'flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'}
    >
        <Trash2Icon className={'w-4 h-4'}/>
    </button>
}