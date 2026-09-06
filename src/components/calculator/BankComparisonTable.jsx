"use client";

import { Check, CircleAlert } from "lucide-react";
import { CurrencyLabel } from "@/components/calculator/CurrencyLabel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { uvaToArs, uvaToUsd } from "@/lib/currency-conversions";
import { SAVINGS_MODE_REDUCE } from "@/constants/mortgage-form";
import { cn, formatArs, formatPercent, formatUsd, formatUva } from "@/lib/utils";

function dashIfEmpty(value, formatter) {
    if (value == null || value <= 0 || Number.isNaN(Number(value))) {
        return "—";
    }
    return formatter(value);
}

function eligibilityLabel(row) {
    if (row.eligible) {
        return "Calificás";
    }
    return row.ineligibleReasons[0] ?? "No calificás";
}

function EligibilityBadge({ row }) {
    if (row.eligible) {
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-300 ring-1 ring-emerald-500/20">
                <Check className="h-3 w-3" aria-hidden="true" />
                Calificás
            </span>
        );
    }

    const reason = row.ineligibleReasons.join(" ");

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-muted-foreground ring-1 ring-white/[0.08]">
                    <CircleAlert className="h-3 w-3" aria-hidden="true" />
                    No calificás
                </span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
                {reason}
            </TooltipContent>
        </Tooltip>
    );
}

function BankCard({ row, selected, isBest, onSelect }) {
    const paymentArs = uvaToArs(row.paymentUva);
    const loanUsd = uvaToUsd(row.maxLoanUva);
    const propertyUsd = uvaToUsd(row.propertyUva);
    const totalUva = row.amortization?.totalPaidUva ?? 0;

    return (
        <li>
            <button
                type="button"
                onClick={() => onSelect(row.bankName)}
                aria-pressed={selected}
                className={cn(
                    "w-full rounded-xl px-4 py-4 text-left ring-1 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    selected
                        ? "bg-primary/10 ring-primary/40"
                        : "bg-white/[0.02] ring-white/[0.05] hover:bg-white/[0.04]",
                    !row.eligible && "opacity-60"
                )}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                            {row.bankName}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            TNA {row.rate != null ? formatPercent(row.rate) : "—"} · {row.termYears}{" "}
                            años
                            {row.termCapped ? " (máx. del banco)" : ""}
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                        {isBest ? (
                            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                                Mejor alcance
                            </span>
                        ) : null}
                        <EligibilityBadge row={row} />
                    </div>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                        <dt className="text-[11px] text-muted-foreground">
                            Recibís <CurrencyLabel currency="usd" className="ml-1 text-[10px]" />
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                            {dashIfEmpty(loanUsd, formatUsd)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[11px] text-muted-foreground">
                            Propiedad <CurrencyLabel currency="usd" className="ml-1 text-[10px]" />
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                            {dashIfEmpty(propertyUsd, formatUsd)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[11px] text-muted-foreground">
                            Cuota <CurrencyLabel currency="ars" className="ml-1 text-[10px]" />
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                            {dashIfEmpty(paymentArs, formatArs)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-[11px] text-muted-foreground">
                            Devolvés <CurrencyLabel currency="uva" className="ml-1 text-[10px]" />
                        </dt>
                        <dd className="mt-0.5 text-sm font-semibold tabular-nums">
                            {dashIfEmpty(totalUva, formatUva)}
                        </dd>
                    </div>
                </dl>
            </button>
        </li>
    );
}

function BankTableRow({ row, selected, isBest, onSelect }) {
    const paymentArs = uvaToArs(row.paymentUva);
    const loanUsd = uvaToUsd(row.maxLoanUva);
    const propertyUsd = uvaToUsd(row.propertyUva);
    const totalUva = row.amortization?.totalPaidUva ?? 0;

    return (
        <tr
            className={cn(
                "cursor-pointer transition-colors duration-150",
                selected ? "bg-primary/10" : "hover:bg-white/[0.02]",
                !row.eligible && "opacity-60"
            )}
            onClick={() => onSelect(row.bankName)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(row.bankName);
                }
            }}
            tabIndex={0}
            aria-selected={selected}
        >
            <th scope="row" className="px-2 py-3 text-left font-medium text-foreground">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate">{row.bankName}</span>
                    <span className="text-[11px] font-normal text-muted-foreground">
                        {row.termYears} años
                        {row.termCapped ? " (máx. del banco)" : ""}
                    </span>
                    {isBest ? (
                        <span className="w-fit rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            Mejor alcance
                        </span>
                    ) : null}
                </div>
            </th>
            <td className="px-2 py-3 text-right tabular-nums text-sm">
                {row.rate != null ? formatPercent(row.rate) : "—"}
            </td>
            <td className="px-2 py-3 text-right tabular-nums text-sm">
                {dashIfEmpty(paymentArs, formatArs)}
            </td>
            <td className="px-2 py-3 text-right tabular-nums text-sm">
                {dashIfEmpty(loanUsd, formatUsd)}
            </td>
            <td className="px-2 py-3 text-right tabular-nums text-sm">
                {dashIfEmpty(propertyUsd, formatUsd)}
            </td>
            <td className="px-2 py-3 text-right tabular-nums text-sm">
                {dashIfEmpty(totalUva, formatUva)}
            </td>
            <td className="px-2 py-3 text-right">
                <EligibilityBadge row={row} />
                <span className="sr-only">{eligibilityLabel(row)}</span>
            </td>
        </tr>
    );
}

export function BankComparisonTable({ rows, selectedBankName, onSelectBank }) {
    const bestName = rows.find((row) => row.eligible)?.bankName ?? null;

    return (
        <TooltipProvider delayDuration={150}>
            <div aria-live="polite">
                <ul className="space-y-3 lg:hidden">
                    {rows.map((row) => (
                        <BankCard
                            key={row.bankName}
                            row={row}
                            selected={row.bankName === selectedBankName}
                            isBest={row.bankName === bestName}
                            onSelect={onSelectBank}
                        />
                    ))}
                </ul>
                <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[760px] border-collapse text-sm">
                        <caption className="sr-only">
                            Comparación de bancos: préstamo máximo, cuota, propiedad y total a
                            devolver
                        </caption>
                        <thead>
                            <tr className="border-b border-white/[0.06]">
                                <th
                                    scope="col"
                                    className="px-2 pb-3 text-left text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                >
                                    Banco
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                >
                                    Tasa TNA
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                >
                                    Cuota ARS
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                >
                                    Recibís USD
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                >
                                    Propiedad USD
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                >
                                    Devolvés UVA
                                </th>
                                <th
                                    scope="col"
                                    className="px-2 pb-3 text-right text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                                >
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.04]">
                            {rows.map((row) => (
                                <BankTableRow
                                    key={row.bankName}
                                    row={row}
                                    selected={row.bankName === selectedBankName}
                                    isBest={row.bankName === bestName}
                                    onSelect={onSelectBank}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-pretty text-xs leading-relaxed text-muted-foreground">
                    La cuota está en pesos de hoy. El préstamo y la propiedad están en dólares.{" "}
                    {rows[0]?.savingsMode === SAVINGS_MODE_REDUCE
                        ? "La propiedad es el valor que cargaste. El préstamo es ese precio menos tus ahorros, si el banco y tu sueldo alcanzan."
                        : "Si te sobra anticipo, ese excedente suma al valor de la propiedad (préstamo + todos tus ahorros)."}{" "}
                    El total a devolver está en UVA e incluye los adelantos que configuraste.
                </p>
            </div>
        </TooltipProvider>
    );
}
