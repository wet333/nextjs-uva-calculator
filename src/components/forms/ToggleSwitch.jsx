"use client";

import { cn } from "@/lib/utils";

export function ToggleSwitch({ id, checked, onChange, label, description }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
                <label htmlFor={id} className="text-sm font-medium text-foreground">
                    {label}
                </label>
                {description ? (
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                ) : null}
            </div>
            <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    checked ? "bg-primary" : "bg-white/[0.12]"
                )}
            >
                <span
                    aria-hidden="true"
                    className={cn(
                        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-150",
                        checked && "translate-x-5"
                    )}
                />
            </button>
        </div>
    );
}
