"use client";

import { forwardRef } from "react";
import { BarChart3, CircleHelp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { BankComparisonTable } from "@/components/calculator/BankComparisonTable";
import { BankDetailPanel } from "@/components/calculator/BankDetailPanel";

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
                side="bottom"
                className="border-border bg-popover text-popover-foreground"
            >
                <p className="text-xs leading-relaxed">{text}</p>
            </HoverCardContent>
        </HoverCard>
    );
}

export const SimulationResults = forwardRef(function SimulationResults(
    { results, selectedBankName, onSelectBank, onExtraStepChange },
    ref
) {
    const selectedRow = results?.find((row) => row.bankName === selectedBankName) ?? null;
    const eligibleCount = results?.filter((row) => row.eligible).length ?? 0;

    return (
        <div ref={ref} className="space-y-6 scroll-mt-24">
            <Card className="min-w-0">
                <CardHeader>
                    <CardTitle tag="h2">Comparación entre bancos</CardTitle>
                    <CardDescription>
                        {results
                            ? `${eligibleCount} de ${results.length} bancos califican con tu sueldo y ahorros. Tocá uno para ver el detalle.`
                            : "El alcance máximo de cada banco aparece acá después de comparar."}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 pt-2">
                        {CONCEPT_HELPS.map((item) => (
                            <ConceptHelp key={item.label} label={item.label} text={item.text} />
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="min-w-0 pt-0">
                    {results != null ? (
                        <BankComparisonTable
                            rows={results}
                            selectedBankName={selectedBankName}
                            onSelectBank={onSelectBank}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/[0.06]">
                                <BarChart3
                                    className="h-5 w-5 text-muted-foreground"
                                    aria-hidden="true"
                                />
                            </div>
                            <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                                Completá sueldo y ahorros y presioná Comparar bancos para ver el
                                préstamo máximo, la cuota y el total a devolver en cada entidad.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
            {results != null ? (
                <Card className="min-w-0">
                    <CardHeader>
                        <CardTitle tag="h2">Detalle del banco</CardTitle>
                        <CardDescription>
                            Monto a recibir, total a devolver y el ahorro si adelantás cuotas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="min-w-0 pt-0">
                        <BankDetailPanel row={selectedRow} onExtraStepChange={onExtraStepChange} />
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
});
