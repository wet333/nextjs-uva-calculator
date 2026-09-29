"use client";

import { cn } from "@/lib/utils";

/** Interruptor accesible (role="switch"); el nombre se lo da un <label htmlFor={id}> externo. */
export function ToggleSwitch({ id, checked, onChange, className }) {
    return (
        <button
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={cn(
                "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                checked ? "bg-primary" : "bg-white/[0.12]",
                className
            )}
        >
            <span
                aria-hidden="true"
                className={cn(
                    "absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150",
                    checked && "translate-x-4"
                )}
            />
        </button>
    );
}
