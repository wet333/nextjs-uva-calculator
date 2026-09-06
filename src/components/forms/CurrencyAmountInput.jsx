"use client";

import { FormattedNumberInput } from "@/components/forms/FormattedNumberInput";
import { cn } from "@/lib/utils";

const CURRENCIES = ["ARS", "USD"];

export function CurrencyToggle({ value, onChange, labelledBy, groupLabel }) {
    return (
        <div
            className="inline-flex h-10 shrink-0 rounded-lg bg-input/80 p-0.5 ring-1 ring-white/[0.06]"
            role="group"
            aria-label={groupLabel}
            aria-labelledby={groupLabel ? undefined : labelledBy}
        >
            {CURRENCIES.map((code) => {
                const active = value === code;
                return (
                    <button
                        key={code}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(code)}
                        className={cn(
                            "min-w-[3.25rem] rounded-md px-2.5 text-xs font-semibold tracking-wide transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                            active
                                ? "bg-primary text-primary-foreground shadow-panel"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {code}
                    </button>
                );
            })}
        </div>
    );
}

export function CurrencyAmountInput({
    id,
    name,
    value,
    onChange,
    onBlur,
    currency,
    onCurrencyChange,
    placeholder,
    max,
    disabled,
    inputRef,
    invalid,
    describedBy,
    currencyLabelledBy,
    currencyGroupLabel,
}) {
    return (
        <div className="flex items-center gap-2">
            <FormattedNumberInput
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                ref={inputRef}
                placeholder={placeholder}
                max={max}
                disabled={disabled}
                aria-invalid={invalid ? true : undefined}
                aria-describedby={describedBy}
                className="min-w-0 flex-1"
            />
            <CurrencyToggle
                value={currency}
                onChange={onCurrencyChange}
                labelledBy={currencyLabelledBy}
                groupLabel={currencyGroupLabel}
            />
        </div>
    );
}
