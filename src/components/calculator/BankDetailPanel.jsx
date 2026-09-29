"use client";

import { CalendarClock, Home, Percent, PiggyBank, UserRound } from "lucide-react";
import { ResultsPanel } from "@/components/calculator/ResultsPanel";
import { ExtraPaymentChart } from "@/components/calculator/ExtraPaymentChart";
import { ExtraInstallmentsSlider } from "@/components/forms/ExtraInstallmentsSlider";
import { Separator } from "@/components/ui/separator";
import { extraStepLabel, SAVINGS_MODE_REDUCE } from "@/constants/mortgage-form";
import { uvaToArs } from "@/lib/currency-conversions";
import { extraPaymentFromInstallments } from "@/lib/mortgage/amortization";
import { cn, formatArs, formatMonthsAsDuration, formatPercent, formatUva } from "@/lib/utils";

function limitingFactorCopy(row) {
    if (row.savingsMode === SAVINGS_MODE_REDUCE) {
        if (row.limitingFactor === "property") {
            return "Préstamo = valor de esta propiedad menos tus ahorros. El sueldo y el tope del banco alcanzan.";
        }
        if (row.limitingFactor === "savings") {
            return "Tus ahorros no cubren el anticipo mínimo de esta propiedad.";
        }
        if (row.limitingFactor === "bank_cap") {
            return "El tope del banco no cubre lo que falta para esta propiedad.";
        }
        if (row.limitingFactor === "income") {
            return "El sueldo no alcanza para financiar esta propiedad.";
        }
    }

    if (row.limitingFactor === "savings") {
        return "Te limitan los ahorros para cubrir el anticipo mínimo.";
    }

    if (row.limitingFactor === "bank_cap") {
        return "Te limita el tope máximo del banco. El excedente de ahorros suma al valor de la propiedad.";
    }

    if (row.limitingFactor === "income") {
        return "Te limita el sueldo (relación cuota/ingreso). El excedente de ahorros suma al valor de la propiedad.";
    }

    return "Monto máximo estimado con tus datos.";
}

function buildDetailMetrics(row) {
    return [
        { title: "Valor de Cuota", uvaAmount: row.paymentUva },
        { title: "Monto a Recibir", uvaAmount: row.maxLoanUva },
        {
            title:
                row.savingsMode === SAVINGS_MODE_REDUCE
                    ? "Valor de la propiedad"
                    : "Propiedad alcanzable",
            uvaAmount: row.propertyUva,
        },
        { title: "Ahorros aplicados", uvaAmount: row.downPaymentUva },
        { title: "Total a Pagar", uvaAmount: row.amortization?.totalPaidUva ?? 0 },
    ];
}

function InfoItem({ label, value }) {
    return (
        <div className="min-w-0">
            <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-foreground">{value}</dd>
        </div>
    );
}

function BankConditions({ bank, rate, ratio }) {
    const selfEmployed =
        bank.for_self_employed == null ? "No aclara" : bank.for_self_employed ? "Sí" : "No";

    return (
        <section>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Condiciones del banco</h3>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <InfoItem
                    label="Tasa con haberes"
                    value={
                        bank.interest_rate_with_salary != null
                            ? formatPercent(bank.interest_rate_with_salary)
                            : "No publica"
                    }
                />
                <InfoItem
                    label="Tasa sin haberes"
                    value={
                        bank.interest_rate_without_salary != null
                            ? formatPercent(bank.interest_rate_without_salary)
                            : "No publica"
                    }
                />
                <InfoItem label="Tasa aplicada" value={rate != null ? formatPercent(rate) : "—"} />
                <InfoItem
                    label="Relación cuota/ingreso"
                    value={ratio != null ? formatPercent(ratio, 0) : "—"}
                />
                <InfoItem label="Financiación máxima" value={`${bank.financing_percentage}%`} />
                <InfoItem label="Plazo máximo" value={`${bank.loan_term_years} años`} />
                <InfoItem
                    label="Ingreso mínimo"
                    value={
                        bank.minimum_income != null
                            ? formatArs(bank.minimum_income)
                            : "Sin piso publicado"
                    }
                />
                <InfoItem label="Sumar ingresos" value={bank.income_with_spouse || "No aclara"} />
                <InfoItem label="Precancelación" value={bank.pre_cancellation || "No aclara"} />
                <InfoItem label="Seguro / destino" value={bank.insurance_premium || "No aclara"} />
                <InfoItem label="Autónomos / monotributo" value={selfEmployed} />
            </dl>
        </section>
    );
}

function StatTile({ label, value, details, highlight }) {
    return (
        <div
            className={cn(
                "min-w-0 rounded-lg px-3 py-2.5 ring-1",
                highlight
                    ? "bg-primary/[0.07] ring-primary/25"
                    : "bg-white/[0.02] ring-white/[0.05]"
            )}
        >
            <dt className="text-[11px] text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums text-foreground">
                {value}
            </dd>
            {details.filter(Boolean).map((detail) => (
                <dd key={detail} className="text-[11px] leading-snug text-muted-foreground">
                    {detail}
                </dd>
            ))}
        </div>
    );
}

/**
 * Adelantos: un solo lugar para el valor elegido y sus efectos (antes se repetían en el
 * gráfico). El cálculo reparte los adelantos mes a mes, así que "pagás por mes" es la cuota
 * base más esa parte, igual que en la simulación.
 */
function ExtraPaymentSummary({ row, onExtraStepChange }) {
    const amortization = row.amortization;

    if (!amortization) {
        return null;
    }

    const hasExtras = row.extraInstallmentsPerYear > 0;
    const baseUva = amortization.basePaymentUva;
    const extraUva = extraPaymentFromInstallments(baseUva, row.extraInstallmentsPerYear);
    const monthlyUva = baseUva + extraUva;
    // maxPaymentUva = sueldo × (cuota/ingreso), así que el sueldo en UVA se recupera de ahí.
    const salaryUva = row.ratio > 0 ? row.maxPaymentUva / (row.ratio / 100) : 0;
    const salaryShare = salaryUva > 0 ? (monthlyUva / salaryUva) * 100 : null;
    const headingId = "extra-installments-heading";

    return (
        <section aria-labelledby={headingId} className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
                <h3 id={headingId} className="text-sm font-semibold text-foreground">
                    Adelantar cuotas
                </h3>
                <span className="text-right text-xs font-medium text-primary">
                    {extraStepLabel(row.extraStepIndex)}
                </span>
            </div>
            {onExtraStepChange ? (
                <ExtraInstallmentsSlider
                    id="detailExtraInstallments"
                    value={row.extraStepIndex}
                    onChange={onExtraStepChange}
                    description=""
                    hideHeader
                />
            ) : null}
            <dl className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                <StatTile
                    highlight
                    label="Pagás por mes"
                    value={formatArs(uvaToArs(monthlyUva))}
                    details={[
                        hasExtras
                            ? `Cuota ${formatArs(uvaToArs(baseUva))} + ${formatArs(uvaToArs(extraUva))} extra`
                            : "Solo la cuota, sin adelantos",
                        salaryShare != null
                            ? `${formatPercent(salaryShare, 0)} de tu sueldo`
                            : null,
                    ]}
                />
                <StatTile
                    label="Plazo"
                    value={formatMonthsAsDuration(amortization.monthsToPayoff)}
                    details={[
                        hasExtras
                            ? `${amortization.monthsSaved} meses menos que el contrato`
                            : `Contrato de ${formatMonthsAsDuration(amortization.scheduledMonths)}`,
                    ]}
                />
                <StatTile
                    label="Total a devolver"
                    value={`${formatUva(amortization.totalPaidUva)} UVA`}
                    details={[
                        hasExtras
                            ? `Sin adelantar: ${formatUva(amortization.scheduledTotalPaidUva)} UVA`
                            : "Mové el control para ver cuánto baja",
                    ]}
                />
                <StatTile
                    label="Ahorro en intereses"
                    value={`${formatUva(amortization.interestSavedUva)} UVA`}
                    details={[hasExtras ? "Frente a no adelantar" : "Sin adelantos no hay ahorro"]}
                />
            </dl>
            <ExtraPaymentChart
                principalUva={row.maxLoanUva}
                annualRatePct={row.rate}
                termMonths={row.termMonths}
                activeStepIndex={row.extraStepIndex}
                onSelectStep={onExtraStepChange}
            />
        </section>
    );
}

export function BankDetailPanel({ row, onExtraStepChange }) {
    if (!row) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <p className="text-sm text-muted-foreground">Elegí un banco para ver el detalle.</p>
            </div>
        );
    }

    const financingDiffers =
        row.maxLoanUva > 0 &&
        Math.abs(row.effectiveFinancingPercentage - row.financingPercentage) > 0.05;

    return (
        <div className="space-y-6">
            {/* El nombre del banco lo muestra el selector de arriba. */}
            <div className="space-y-3">
                <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                    {row.eligible ? limitingFactorCopy(row) : row.ineligibleReasons.join(" ")}
                </p>
                <div className="flex flex-wrap gap-2">
                    {row.rate != null ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-white/[0.06]">
                            <Percent className="h-3 w-3" aria-hidden="true" />
                            TNA {formatPercent(row.rate)}
                        </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-white/[0.06]">
                        <Home className="h-3 w-3" aria-hidden="true" />
                        {financingDiffers
                            ? `Financia ${formatPercent(row.effectiveFinancingPercentage, 0)} (máx. ${row.financingPercentage}%)`
                            : `Financia ${row.financingPercentage}%`}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-white/[0.06]">
                        <CalendarClock className="h-3 w-3" aria-hidden="true" />
                        {row.termYears} años
                        {row.termCapped ? " (máx. del banco)" : ""}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-white/[0.06]">
                        <UserRound className="h-3 w-3" aria-hidden="true" />
                        Cuota / ingreso {formatPercent(row.ratio, 0)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] text-muted-foreground ring-1 ring-white/[0.06]">
                        <PiggyBank className="h-3 w-3" aria-hidden="true" />
                        {row.savingsMode === SAVINGS_MODE_REDUCE
                            ? "Casa puntual"
                            : "Hasta cuánto podés comprar"}
                    </span>
                </div>
            </div>
            {row.maxLoanUva > 0 ? <ResultsPanel results={buildDetailMetrics(row)} /> : null}
            {row.maxLoanUva > 0 ? (
                <ExtraPaymentSummary row={row} onExtraStepChange={onExtraStepChange} />
            ) : null}
            <Separator className="bg-white/[0.06]" />
            <BankConditions bank={row.bank} rate={row.rate} ratio={row.ratio} />
        </div>
    );
}
