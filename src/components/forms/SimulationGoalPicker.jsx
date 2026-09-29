"use client";

import { Lightbulb } from "lucide-react";
import { SAVINGS_MODE_EXPAND, SAVINGS_MODE_REDUCE } from "@/constants/mortgage-form";
import { arsToUsd, usdToArs } from "@/lib/currency-conversions";
import { cn, formatArs, formatUsd } from "@/lib/utils";

/**
 * Cada opción se nombra con la pregunta del usuario (no con el mecanismo) y muestra la
 * fórmula: los términos normales los cargás vos, el resaltado es lo que calculamos.
 */
const GOALS = [
    {
        value: SAVINGS_MODE_EXPAND,
        title: "¿Hasta cuánto puedo comprar?",
        formula: ["Ahorros", "+", "préstamo máximo"],
        result: "precio de la casa",
    },
    {
        value: SAVINGS_MODE_REDUCE,
        title: "¿Me alcanza para una casa puntual?",
        formula: ["Precio de la casa", "−", "ahorros"],
        result: "préstamo a pedir",
    },
];

function formatMoney(amount, currency) {
    return currency === "USD" ? formatUsd(amount) : formatArs(amount);
}

/** Pasa `amount` a `to`; null si faltan cotizaciones. */
function convertAmount(amount, from, to) {
    if (from === to) {
        return amount;
    }
    try {
        return from === "USD" ? usdToArs(amount) : arsToUsd(amount);
    } catch {
        return null;
    }
}

/** Explicación en una línea con los números que cargó el usuario. */
function goalSummary({ mode, savings, savingsCurrency, propertyValue, propertyCurrency }) {
    const hasSavings = Number(savings) > 0;
    const savingsText = hasSavings ? formatMoney(savings, savingsCurrency) : null;

    if (mode === SAVINGS_MODE_EXPAND) {
        return hasSavings
            ? `Tus ${savingsText} van completos al anticipo y cada banco suma lo máximo que te presta según tu sueldo. El resultado es el precio de casa al que llegás.`
            : "Tus ahorros van completos al anticipo y cada banco suma lo máximo que te presta según tu sueldo. El resultado es el precio de casa al que llegás.";
    }

    if (!(Number(propertyValue) > 0)) {
        return "Cargá el precio de la casa. Tus ahorros cubren el anticipo y el banco presta solo lo que falta.";
    }

    const priceText = formatMoney(propertyValue, propertyCurrency);
    const savingsInPropertyCurrency = hasSavings
        ? convertAmount(Number(savings), savingsCurrency, propertyCurrency)
        : null;

    if (savingsInPropertyCurrency == null) {
        return `Tus ahorros cubren el anticipo de la casa de ${priceText} y el banco presta lo que falta. Te mostramos qué bancos la financian.`;
    }

    const loan = Number(propertyValue) - savingsInPropertyCurrency;
    if (loan <= 0) {
        return `Tus ahorros cubren los ${priceText} de la casa: no necesitás préstamo.`;
    }
    return `${priceText} − tus ${savingsText} de ahorros = pedís ${formatMoney(loan, propertyCurrency)} al banco. Te mostramos qué bancos lo financian y con qué cuota.`;
}

function GoalOption({ name, goal, checked, onSelect }) {
    return (
        <label
            className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2.5 ring-1 transition-colors",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/50",
                checked
                    ? "bg-primary/10 ring-primary/40"
                    : "bg-white/[0.02] ring-white/[0.06] hover:bg-white/[0.04]"
            )}
        >
            <input
                type="radio"
                name={name}
                value={goal.value}
                checked={checked}
                onChange={() => onSelect(goal.value)}
                className="sr-only"
            />
            <span
                aria-hidden="true"
                className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ring-1",
                    checked ? "ring-primary" : "ring-white/25"
                )}
            >
                {checked ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{goal.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {goal.formula.join(" ")}{" "}
                    <span className="whitespace-nowrap">
                        ={" "}
                        <span
                            className={cn(
                                "font-semibold",
                                checked ? "text-primary" : "text-foreground/80"
                            )}
                        >
                            {goal.result}
                        </span>
                    </span>
                </span>
            </span>
        </label>
    );
}

/**
 * Qué se quiere averiguar con los ahorros ("expand": precio máximo alcanzable, "reduce":
 * si alcanza para un precio dado). `children` es el campo que se revela con la segunda opción.
 */
export function SimulationGoalPicker({
    id,
    value,
    onChange,
    savings,
    savingsCurrency,
    propertyValue,
    propertyCurrency,
    children,
}) {
    const summary = goalSummary({
        mode: value,
        savings,
        savingsCurrency,
        propertyValue,
        propertyCurrency,
    });

    return (
        <fieldset id={id} className="min-w-0 space-y-3">
            <legend className="mb-2 text-sm font-medium text-foreground">
                ¿Qué querés averiguar?
            </legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
                {GOALS.map((goal) => (
                    <GoalOption
                        key={goal.value}
                        name={id}
                        goal={goal}
                        checked={value === goal.value}
                        onSelect={onChange}
                    />
                ))}
            </div>
            {children}
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
                <Lightbulb className="mt-px h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                {summary}
            </p>
        </fieldset>
    );
}
