"use client";

import { cn } from "@/lib/utils";
import { SAVINGS_MODE_EXPAND, SAVINGS_MODE_REDUCE } from "@/constants/mortgage-form";

const OPTIONS = [
    {
        value: SAVINGS_MODE_EXPAND,
        title: "Sumar al límite de compra",
        description: "El banco presta el máximo (75.000) y la casa pasa a 125.000.",
    },
    {
        value: SAVINGS_MODE_REDUCE,
        title: "Quitar financiación",
        description: "Cargás el precio. Casa 100.000 y 50.000 de ahorros: el banco presta 50.000.",
    },
];

export function SavingsModeToggle({ id, value, onChange }) {
    const labelId = `${id}-label`;

    return (
        <div className="flex min-w-0 flex-col gap-2">
            <div>
                <p id={labelId} className="text-sm font-medium text-foreground">
                    Uso de los ahorros
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Ejemplo: casa de 100.000, banco al 75% (anticipo mínimo 25.000) y 50.000
                    ahorrados.
                </p>
            </div>
            <div
                role="radiogroup"
                aria-labelledby={labelId}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
                {OPTIONS.map((option) => {
                    const selected = value === option.value;
                    return (
                        <button
                            key={option.value}
                            id={selected ? id : undefined}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                "rounded-lg px-3 py-3 text-left ring-1 transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                selected
                                    ? "bg-primary/10 ring-primary/40"
                                    : "bg-white/[0.02] ring-white/[0.06] hover:bg-white/[0.04]"
                            )}
                        >
                            <span className="block text-sm font-medium text-foreground">
                                {option.title}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                {option.description}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
