"use client";

import { useMemo, useRef, useState } from "react";
import { SimulationForm } from "@/components/calculator/SimulationForm";
import { SimulationResults } from "@/components/calculator/SimulationResults";
import { useRates } from "@/components/providers/RatesProvider";
import {
    DEFAULT_SAVINGS_MODE,
    DEFAULT_TERM_YEARS,
    extrasPerYearFromStep,
    SAVINGS_MODE_REDUCE,
} from "@/constants/mortgage-form";
import { buildBankComparisons } from "@/lib/mortgage/build-simulation-results";

const RATES_UNAVAILABLE_MESSAGE =
    "Las cotizaciones del dólar MEP y la UVA no están disponibles. Esperá a que carguen o recargá la página.";

export default function HomePage() {
    const [scenario, setScenario] = useState(null);
    const [extraStepIndex, setExtraStepIndex] = useState(0);
    const [termYears, setTermYears] = useState(DEFAULT_TERM_YEARS);
    const [savingsMode, setSavingsMode] = useState(DEFAULT_SAVINGS_MODE);
    const [propertyValue, setPropertyValue] = useState("");
    const [propertyCurrency, setPropertyCurrency] = useState("USD");
    const [selectedBankName, setSelectedBankName] = useState(null);
    const [submitError, setSubmitError] = useState(null);
    const { ready: ratesReady } = useRates();
    const resultsRef = useRef(null);

    const results = useMemo(() => {
        if (!scenario || !ratesReady) {
            return null;
        }

        return buildBankComparisons({
            ...scenario,
            termYears,
            extraStepIndex,
            extraInstallmentsPerYear: extrasPerYearFromStep(extraStepIndex),
            savingsMode,
            propertyValue: savingsMode === SAVINGS_MODE_REDUCE ? propertyValue : "",
            propertyCurrency,
        });
    }, [
        scenario,
        extraStepIndex,
        termYears,
        savingsMode,
        propertyValue,
        propertyCurrency,
        ratesReady,
    ]);

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

        setScenario({
            salary: values.salary,
            salaryCurrency: values.salaryCurrency,
            savings: values.savings,
            savingsCurrency: values.savingsCurrency,
            salaryAccount: values.salaryAccount,
        });
        setTermYears(values.termYears);
        setExtraStepIndex(values.extraStepIndex);
        setSavingsMode(values.savingsMode);
        setPropertyValue(values.propertyValue);
        setPropertyCurrency(values.propertyCurrency);
        setSelectedBankName(null);
        scrollToResults();
    };

    const selectedName = useMemo(() => {
        if (!results) {
            return null;
        }

        if (selectedBankName && results.some((row) => row.bankName === selectedBankName)) {
            return selectedBankName;
        }

        return results.find((row) => row.eligible)?.bankName ?? results[0]?.bankName ?? null;
    }, [results, selectedBankName]);

    return (
        <div className="mx-auto min-w-0 max-w-[1200px] space-y-8">
            <SimulationForm
                extraStepIndex={extraStepIndex}
                onExtraStepChange={setExtraStepIndex}
                termYears={termYears}
                onTermYearsChange={setTermYears}
                savingsMode={savingsMode}
                onSavingsModeChange={setSavingsMode}
                propertyValue={propertyValue}
                propertyCurrency={propertyCurrency}
                onPropertyValueChange={setPropertyValue}
                onPropertyCurrencyChange={setPropertyCurrency}
                onSubmit={onSubmit}
                submitError={submitError}
            />
            <SimulationResults
                ref={resultsRef}
                results={results}
                selectedBankName={selectedName}
                onSelectBank={setSelectedBankName}
                onExtraStepChange={setExtraStepIndex}
            />
        </div>
    );
}
