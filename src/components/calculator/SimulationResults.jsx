"use client";

import { forwardRef } from "react";
import { BarChart3, CircleHelp, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BankDetailPanel } from "@/components/calculator/BankDetailPanel";
import { BankPicker } from "@/components/calculator/BankPicker";
import { SAVINGS_MODE_REDUCE } from "@/constants/mortgage-form";
import { uvaToArs, uvaToUsd } from "@/lib/currency-conversions";
import { formatArs, formatUsd } from "@/lib/utils";

const CONCEPT_HELPS = [
    {
        label: "UVA",
        text: "La UVA sigue la inflación. La cuota en pesos sube, pero el valor en UVA se mantiene. Por eso el total a devolver se muestra en UVA: es el costo real del crédito.",
    },
    {
        label: "Cuota / ingreso",
        text: "Los bancos limitan la primera cuota a un porcentaje del sueldo (en general 25%). Ese tope define cuánto te pueden prestar, junto con tus ahorros y el máximo de la entidad.",
    },
    {
        label: "Adelantos",
        text: "La escala va de 1 cuota extra cada 12 meses hasta 4 extras por mes. El banco aplica ese dinero a capital: se acorta el plazo y pagás menos intereses. La cuota contractual no cambia.",
    },
];

function ConceptHelp({ label, text }) {
    return (
        <HoverCard openDelay={100} closeDelay={200}>
            <HoverCardTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-muted-foreground ring-1 ring-white/[0.06] transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    {label}
                    <CircleHelp className="h-3 w-3" aria-hidden="true" />
                </button>
            </HoverCardTrigger>
            <HoverCardContent
                side="top"
                className="border-border bg-popover text-popover-foreground"
            >
                <p className="text-xs leading-relaxed">{text}</p>
            </HoverCardContent>
        </HoverCard>
    );
}

function formatMoney(amount, currency) {
    return currency === "USD" ? formatUsd(amount) : formatArs(amount);
}

/** Título = la pregunta elegida en el escenario; respuesta = el mejor banco y cuántos califican. */
function headline({ results, scenarioSummary }) {
    const eligible = results.filter((row) => row.eligible);
    const best = eligible[0];
    const total = results.length;

    if (scenarioSummary.savingsMode === SAVINGS_MODE_REDUCE) {
        const price =
            Number(scenarioSummary.propertyValue) > 0
                ? formatMoney(scenarioSummary.propertyValue, scenarioSummary.propertyCurrency)
                : null;
        return {
            title: price ? `¿Te alcanza para la casa de ${price}?` : "¿Te alcanza para la casa?",
            answer: best
                ? `Sí, con ${eligible.length} de ${total} bancos. La cuota más baja es con ${best.bankName}: ${formatArs(uvaToArs(best.paymentUva))} por mes.`
                : "Con este escenario ningún banco la financia. En cada banco ves el motivo.",
        };
    }

    return {
        title: "¿Hasta cuánto podés comprar?",
        answer: best
            ? `Con ${best.bankName} llegás a una casa de hasta ${formatUsd(uvaToUsd(best.propertyUva))}. Calificás en ${eligible.length} de ${total} bancos.`
            : "Con este escenario no calificás en ningún banco. En cada banco ves el motivo.",
    };
}

function ScenarioRecap({ scenarioSummary, onEdit }) {
    const { salary, salaryCurrency, savings, savingsCurrency, termYears, salaryAccount } =
        scenarioSummary;

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <p className="tabular-nums">
                Sueldo {formatMoney(salary, salaryCurrency)} · Ahorros{" "}
                {formatMoney(savings, savingsCurrency)} · {termYears} años ·{" "}
                {salaryAccount ? "con" : "sin"} haberes
            </p>
            <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
                <Pencil className="h-3 w-3" aria-hidden="true" />
                Editar escenario
            </button>
        </div>
    );
}

export const SimulationResults = forwardRef(function SimulationResults(
    { results, scenarioSummary, selectedBankName, onSelectBank, onExtraStepChange, onEditScenario },
    ref
) {
    if (results == null) {
        return (
            <div ref={ref} className="scroll-mt-24">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/[0.06]">
                            <BarChart3
                                className="h-5 w-5 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </div>
                        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                            Completá tu escenario y presioná Comparar bancos: acá vas a ver la
                            respuesta y el detalle de cada banco.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const selectedRow = results.find((row) => row.bankName === selectedBankName) ?? null;
    const { title, answer } = headline({ results, scenarioSummary });

    return (
        <div ref={ref} className="scroll-mt-24">
            <Card className="min-w-0">
                <CardHeader className="space-y-2">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-primary">
                        Resultado
                    </p>
                    <CardTitle tag="h2">{title}</CardTitle>
                    <p className="text-pretty text-sm leading-relaxed text-foreground/90">
                        {answer}
                    </p>
                    <ScenarioRecap scenarioSummary={scenarioSummary} onEdit={onEditScenario} />
                </CardHeader>
                <CardContent className="min-w-0 space-y-5 pt-0">
                    <div>
                        <BankPicker
                            id="selectedBank"
                            rows={results}
                            selectedBankName={selectedBankName}
                            onSelectBank={onSelectBank}
                        />
                    </div>
                    <BankDetailPanel row={selectedRow} onExtraStepChange={onExtraStepChange} />
                    <div className="flex flex-col gap-3 border-t border-white/[0.05] pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-pretty text-xs leading-relaxed text-muted-foreground">
                            La cuota está en pesos de hoy; el préstamo y la propiedad, en dólares;
                            el total a devolver, en UVA.
                        </p>
                        <div className="flex shrink-0 flex-wrap gap-2">
                            {CONCEPT_HELPS.map((item) => (
                                <ConceptHelp key={item.label} label={item.label} text={item.text} />
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});
