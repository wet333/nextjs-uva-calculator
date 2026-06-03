"use client";

import { forwardRef } from "react";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsPanel } from "@/components/calculator/ResultsPanel";

export const SimulationResults = forwardRef(function SimulationResults({ results }, ref) {
    return (
        <Card ref={ref} className="scroll-mt-24">
            <CardHeader>
                <CardTitle tag="h2">Resultados de la simulación</CardTitle>
                <CardDescription>
                    Montos estimados en UVA, USD y ARS según cotización del día.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                {results != null ? (
                    <ResultsPanel results={results} />
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.03] ring-1 ring-white/[0.06]">
                            <BarChart3
                                className="h-5 w-5 text-muted-foreground"
                                aria-hidden="true"
                            />
                        </div>
                        <p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
                            Completá los parámetros y presioná Calcular simulación para ver los
                            montos estimados.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});
