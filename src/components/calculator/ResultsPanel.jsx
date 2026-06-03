"use client";

import { Briefcase, Coins, HandCoins, Info, PiggyBank, Receipt } from "lucide-react";
import { CurrencyLabel } from "@/components/calculator/CurrencyLabel";
import { uvaToArs, uvaToUsd } from "@/lib/currency-conversions";
import { formatUva } from "@/lib/utils";

const METRIC_ICONS = {
    "Valor de Cuota": Coins,
    "Ahorros Necesarios": PiggyBank,
    "Monto a Recibir": HandCoins,
    "Total a Pagar": Receipt,
    "Sueldo Requerido": Briefcase,
};

const CURRENCIES = [
    { key: "uva", currency: "uva", label: "UVA" },
    { key: "usd", currency: "usd", label: "USD" },
    { key: "ars", currency: "ars", label: "ARS" },
];

function formatWholeAmount(value) {
    if (value == null || Number.isNaN(Number(value))) {
        return "N/A";
    }

    return new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value));
}

function AmountValue({ amount }) {
    if (amount === "N/A") {
        return "N/A";
    }

    return <span>{amount}</span>;
}

function getResultAmounts(item) {
    return {
        arsAmount: uvaToArs(item.uvaAmount),
        usdAmount: uvaToUsd(item.uvaAmount),
    };
}

function ResultMetricHeader({ title }) {
    const Icon = METRIC_ICONS[title] ?? Coins;

    return (
        <div className="flex min-w-0 items-center gap-2.5">
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground/80" aria-hidden="true" />
            <span className="min-w-0 text-sm font-medium text-foreground">{title}</span>
        </div>
    );
}

function getResultAmountStrings(item) {
    const { arsAmount, usdAmount } = getResultAmounts(item);

    return {
        uva: formatUva(item.uvaAmount),
        usd: formatWholeAmount(usdAmount),
        ars: formatWholeAmount(arsAmount),
    };
}

function DesktopAmountCell({ amount, currency }) {
    if (amount === "N/A") {
        return "N/A";
    }

    return (
        <span className="inline-flex items-baseline justify-end gap-1.5">
            <span className="font-semibold tabular-nums">{amount}</span>
            <CurrencyLabel currency={currency} className="text-[10px] leading-none" />
        </span>
    );
}

function MobileResultItem({ item }) {
    const amounts = getResultAmountStrings(item);
    const headingId = `result-${item.title.replace(/\s+/g, "-").toLowerCase()}`;

    return (
        <li className="py-4 first:pt-0 last:pb-0">
            <article aria-labelledby={headingId}>
                <h3 id={headingId} className="mb-3">
                    <ResultMetricHeader title={item.title} />
                </h3>
                <dl className="grid grid-cols-3 gap-x-2">
                    {CURRENCIES.map(({ key, currency }) => (
                        <div key={key} className="min-w-0 text-center">
                            <dt className="text-[11px]">
                                <CurrencyLabel currency={currency} />
                            </dt>
                            <dd className="mt-1 text-xs font-semibold leading-snug tabular-nums text-foreground">
                                <AmountValue amount={amounts[key]} />
                            </dd>
                        </div>
                    ))}
                </dl>
            </article>
        </li>
    );
}

function ResultsMobileList({ results }) {
    return (
        <ul className="divide-y divide-white/[0.04] md:hidden">
            {results.map((item) => (
                <MobileResultItem key={item.title} item={item} />
            ))}
        </ul>
    );
}

function ResultTableRow({ item }) {
    const amounts = getResultAmountStrings(item);

    return (
        <tr className="group transition-colors duration-150 hover:bg-white/[0.02]">
            <th scope="row" className="px-2 py-3.5 text-left font-medium text-foreground">
                <ResultMetricHeader title={item.title} />
            </th>
            {CURRENCIES.map(({ key, currency }) => (
                <td key={key} className="px-2 py-3.5 text-right text-sm text-foreground">
                    <DesktopAmountCell amount={amounts[key]} currency={currency} />
                </td>
            ))}
        </tr>
    );
}

function ResultsTable({ results }) {
    return (
        <div className="hidden md:block">
            <table className="w-full border-collapse text-sm">
                <caption className="sr-only">
                    Resultados del cálculo en UVA, USD y ARS al tipo de cambio de hoy
                </caption>
                <thead>
                    <tr className="border-b border-white/[0.06]">
                        <th
                            scope="col"
                            className="px-2 pb-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                        >
                            Concepto
                        </th>
                        {CURRENCIES.map(({ currency, label }) => (
                            <th
                                key={currency}
                                scope="col"
                                className="px-2 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                            >
                                {label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                    {results.map((item) => (
                        <ResultTableRow key={item.title} item={item} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ResultsDisclaimer() {
    return (
        <p className="flex items-start gap-2 text-pretty text-xs leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>
                Conversiones calculadas con cotización MEP (dolarapi) y valor UVA publicado por el
                BCRA. Montos expresados sin impuestos ni seguros.
            </span>
        </p>
    );
}

export function ResultsPanel({ results }) {
    return (
        <div className="space-y-4">
            <div aria-live="polite">
                <ResultsMobileList results={results} />
                <ResultsTable results={results} />
            </div>
            <ResultsDisclaimer />
        </div>
    );
}
