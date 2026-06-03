"use client";

import {
    Briefcase,
    Coins,
    HandCoins,
    Info,
    PiggyBank,
    Receipt,
} from "lucide-react";
import { uvaToArs, uvaToUsd } from "@/lib/currencyConvertions";
import { formatUva } from "@/lib/utils";

const METRIC_ICONS = {
    "Valor de Cuota": Coins,
    "Ahorros Necesarios": PiggyBank,
    "Monto a Recibir": HandCoins,
    "Total a Pagar": Receipt,
    "Sueldo Requerido": Briefcase,
};

function formatWholeAmount(value) {
    if (value == null || Number.isNaN(Number(value))) {
        return "N/A";
    }

    return new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function UnitAmount({ amount, unit }) {
    if (amount === "N/A") {
        return "N/A";
    }

    return (
        <>
            <span>{amount}</span>
            <span className="font-semibold text-primary">{`\u00A0${unit}`}</span>
        </>
    );
}

function UvaAmount({ value }) {
    return <UnitAmount amount={formatUva(value)} unit="UVA" />;
}

function ResultRow({ item }) {
    const Icon = METRIC_ICONS[item.title] ?? Coins;
    const arsAmount = uvaToArs(item.uvaAmount);
    const usdAmount = uvaToUsd(item.uvaAmount);

    return (
        <tr className="transition-[background-color] duration-150 hover:bg-primary/5">
            <th
                scope="row"
                className="min-w-0 px-3 py-2.5 text-left font-semibold text-foreground sm:px-4 sm:py-3"
            >
                <div className="flex min-w-0 items-center gap-2.5">
                    <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary"
                        aria-hidden="true"
                    >
                        <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="min-w-0 text-sm sm:text-base">{item.title}</span>
                </div>
            </th>
            <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground sm:px-4 sm:py-3 sm:text-base">
                <UvaAmount value={item.uvaAmount} />
            </td>
            <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground sm:px-4 sm:py-3 sm:text-base">
                <UnitAmount amount={formatWholeAmount(usdAmount)} unit="USD" />
            </td>
            <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-foreground sm:px-4 sm:py-3 sm:text-base">
                <UnitAmount amount={formatWholeAmount(arsAmount)} unit="ARS" />
            </td>
        </tr>
    );
}

export default function ResultsPanel({ results }) {
    return (
        <div className="space-y-5">
            <div className="overflow-x-auto rounded-xl border border-border/80 bg-surface-elevated/40 shadow-card">
                <table className="w-full min-w-[32rem] border-collapse text-sm">
                    <caption className="sr-only">
                        Resultados del cálculo en UVA, USD y ARS al tipo de cambio
                        de hoy
                    </caption>
                    <thead>
                        <tr className="border-b border-border/60 bg-muted/30">
                            <th
                                scope="col"
                                className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3"
                            >
                                Concepto
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3"
                            >
                                UVA
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3"
                            >
                                USD
                            </th>
                            <th
                                scope="col"
                                className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground sm:px-4 sm:py-3"
                            >
                                ARS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                        {results.map((item) => (
                            <ResultRow key={item.title} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="flex items-start gap-2 text-pretty text-xs leading-relaxed text-muted-foreground">
                <Info
                    className="mt-0.5 h-3.5 w-3.5 shrink-0"
                    aria-hidden="true"
                />
                <span>
                    Conversiones con cotización MEP (dolarapi) y valor UVA del día.
                </span>
            </p>
        </div>
    );
}
