"use client";

import { useRef, useState } from "react";
import { SimulationForm } from "@/components/calculator/SimulationForm";
import { SimulationResults } from "@/components/calculator/SimulationResults";
import { useRates } from "@/components/providers/RatesProvider";
import { buildSimulationResults } from "@/lib/mortgage/build-simulation-results";
import { calculatePaymentsArs } from "@/lib/mortgage/calculate-payments";

const RATES_UNAVAILABLE_MESSAGE =
    "Las cotizaciones del dólar MEP y la UVA no están disponibles. Esperá a que carguen o recargá la página.";

export default function HomePage() {
    const [results, setResults] = useState(null);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const { ready: ratesReady } = useRates();
    const resultsRef = useRef(null);

    const scrollToResults = () => {
        requestAnimationFrame(() => {
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;
            resultsRef.current?.scrollIntoView({
                behavior: prefersReducedMotion ? "auto" : "smooth",
                block: "start",
            });
        });
    };

    const onSubmit = async (values) => {
        setSubmitError(null);

        if (!ratesReady) {
            setSubmitError(RATES_UNAVAILABLE_MESSAGE);
            return;
        }

        await new Promise((resolve) => requestAnimationFrame(resolve));

        const loanAmountUsd = (values.propertyValue * values.financialPercentage) / 100;

        const paymentCalculations = calculatePaymentsArs(
            parseFloat(values.interestRate),
            loanAmountUsd,
            parseInt(values.mortgageDuration, 10)
        );

        setResults(buildSimulationResults(values, paymentCalculations));
        scrollToResults();
    };

    return (
        <div className="mx-auto min-w-0 max-w-[1200px] space-y-8">
            <SimulationForm
                selectedPreset={selectedPreset}
                onPresetChange={setSelectedPreset}
                onSubmit={onSubmit}
                submitError={submitError}
            />
            <SimulationResults ref={resultsRef} results={results} />
        </div>
    );
}
