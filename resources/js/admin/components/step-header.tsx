interface StepHeaderProps {
    step?: number;
    label: string;
}

export function StepHeader({step, label}: StepHeaderProps) {
    return (
        <div className="flex items-center gap-3">
            {step !== undefined && (
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {step}
                </span>
            )}
            <span className="text-sm font-semibold text-foreground">{label}</span>
            <span className="h-px flex-1 bg-border" />
        </div>
    );
}
