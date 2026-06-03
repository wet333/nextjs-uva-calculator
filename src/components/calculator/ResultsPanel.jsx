"use client";

import { Briefcase, Coins, HandCoins, Info, PiggyBank, Receipt } from "lucide-react";
import { uvaToArs, uvaToUsd } from "@/lib/currency-conversions";
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
            <span className="text-muted-foreground">{`\u00A0${unit}`}</span>
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
        <tr className="group transition-colors duration-150 hover:bg-white/[0.02]">
            <th
                scope="row"
                className="min-w-0 px-1 py-3.5 text-left font-medium text-foreground sm:px-2"
            >
                <div className="flex min-w-0 items-center gap-2.5">
                    <Icon
                        className="h-4 w-4 shrink-0 text-muted-foreground/80 transition-colors duration-150 group-hover:text-primary/80"
                        aria-hidden="true"
                    />
                    <span className="min-w-0 text-sm">{item.title}</span>
                </div>
            </th>
            <td className="px-1 py-3.5 text-right text-sm font-semibold tabular-nums text-foreground sm:px-2">
                <UvaAmount value={item.uvaAmount} />
            </td>
            <td className="px-1 py-3.5 text-right text-sm tabular-nums text-foreground sm:px-2">
                <UnitAmount amount={formatWholeAmount(usdAmount)} unit="USD" />
            </td>
            <td className="px-1 py-3.5 text-right text-sm tabular-nums text-foreground sm:px-2">
                <UnitAmount amount={formatWholeAmount(arsAmount)} unit="ARS" />
            </td>
        </tr>
    );
}

export function ResultsPanel({ results }) {
    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[32rem] border-collapse text-sm">
                    <caption className="sr-only">
                        Resultados del cálculo en UVA, USD y ARS al tipo de cambio de hoy
                    </caption>
                    <thead>
                        <tr className="border-b border-white/[0.06]">
                            <th
                                scope="col"
                                className="px-1 pb-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:px-2"
                            >
                                Concepto
                            </th>
                            <th
                                scope="col"
                                className="px-1 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:px-2"
                            >
                                UVA
                            </th>
                            <th
                                scope="col"
                                className="px-1 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:px-2"
                            >
                                USD
                            </th>
                            <th
                                scope="col"
                                className="px-1 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:px-2"
                            >
                                ARS
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                        {results.map((item) => (
                            <ResultRow key={item.title} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="flex items-start gap-2 text-pretty text-xs leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                    Conversiones calculadas con cotización MEP (dolarapi) y valor UVA publicado por
                    el BCRA. Montos expresados sin impuestos ni seguros.
                </span>
            </p>
        </div>
    );
}
