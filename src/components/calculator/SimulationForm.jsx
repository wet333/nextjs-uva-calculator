"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Percent, DollarSign, CalendarClock, Loader2, Landmark } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { InputWithIcon } from "@/components/forms/InputWithIcon";
import { FormattedNumberInput } from "@/components/forms/FormattedNumberInput";
import { useRates } from "@/components/providers/RatesProvider";
import { arsToUsd } from "@/lib/currency-conversions";
import { MORTGAGE_FIELD_ERRORS, MORTGAGE_FORM_DEFAULTS } from "@/constants/mortgage-form";
import {
    buildLoanTermOptions,
    findBankPresetByName,
    getBankPresets,
    sortBankPresetsBySalaryRate,
} from "@/lib/mortgage/bank-presets";
import { formatThousandsDisplay } from "@/lib/utils";

export function SimulationForm({ selectedPreset, onPresetChange, onSubmit, submitError }) {
    const { loading: ratesLoading } = useRates();

    const sortedBankPresets = useMemo(() => sortBankPresetsBySalaryRate(getBankPresets()), []);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        reset,
        setFocus,
    } = useForm({
        defaultValues: MORTGAGE_FORM_DEFAULTS,
    });

    useEffect(() => {
        if (selectedPreset) {
            reset({
                propertyValue: "",
                financialPercentage: selectedPreset.financing_percentage || "",
                mortgageDuration: selectedPreset.loan_term_years || "",
                interestRate: selectedPreset.interest_rate_with_salary || "",
                salaryPaymentRatio: selectedPreset.income_to_loan_ratio || "",
            });
        } else {
            reset(MORTGAGE_FORM_DEFAULTS);
        }
    }, [selectedPreset, reset]);

    const onInvalid = (invalidErrors) => {
        const firstKey = Object.keys(invalidErrors)[0];
        if (firstKey) {
            setFocus(firstKey);
        }
    };

    const maxPropertyValue = selectedPreset?.loan_amount_ars
        ? arsToUsd(selectedPreset.loan_amount_ars)
        : 999999999;

    const loanTermOptions = useMemo(
        () => buildLoanTermOptions(selectedPreset?.loan_term_years ?? 30),
        [selectedPreset]
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle tag="h2">Parámetros de simulación</CardTitle>
                <CardDescription>
                    Ingresá los datos del préstamo. Podés seleccionar un banco para aplicar sus
                    condiciones oficiales.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
                    <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                        <div className="col-span-full">
                            <InputWithIcon labelText="Banco" htmlFor="presetSelect" icon={Landmark}>
                                <Select
                                    id="presetSelect"
                                    name="bankPreset"
                                    autoComplete="off"
                                    value={selectedPreset?.name || ""}
                                    onChange={(e) => {
                                        onPresetChange(findBankPresetByName(e.target.value));
                                    }}
                                >
                                    <option value="">Sin restricciones…</option>
                                    {sortedBankPresets.map((preset) => (
                                        <option key={preset.name} value={preset.name}>
                                            {preset.name}
                                        </option>
                                    ))}
                                </Select>
                            </InputWithIcon>
                        </div>
                        <InputWithIcon
                            labelText="Valor de la Propiedad (USD)"
                            htmlFor="propertyValue"
                            icon={DollarSign}
                            error={errors.propertyValue?.message}
                        >
                            <Controller
                                name="propertyValue"
                                control={control}
                                rules={{
                                    required: MORTGAGE_FIELD_ERRORS.propertyValue,
                                    min: {
                                        value: 1,
                                        message: "El valor debe ser mayor a 0.",
                                    },
                                    max: {
                                        value: maxPropertyValue,
                                        message: `El valor no puede superar U$D ${formatThousandsDisplay(maxPropertyValue)}.`,
                                    },
                                }}
                                render={({ field }) => (
                                    <FormattedNumberInput
                                        id="propertyValue"
                                        name="propertyValue"
                                        placeholder="Ej. 150.000…"
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        max={maxPropertyValue}
                                        aria-invalid={errors.propertyValue ? true : undefined}
                                        aria-describedby={
                                            errors.propertyValue ? "propertyValue-error" : undefined
                                        }
                                        className="tabular-nums"
                                    />
                                )}
                            />
                        </InputWithIcon>
                        <InputWithIcon
                            labelText="Porcentaje Financiado"
                            htmlFor="financialPercentage"
                            icon={Percent}
                            error={errors.financialPercentage?.message}
                        >
                            <Input
                                {...register("financialPercentage", {
                                    required: MORTGAGE_FIELD_ERRORS.financialPercentage,
                                    valueAsNumber: true,
                                })}
                                id="financialPercentage"
                                name="financialPercentage"
                                type="number"
                                placeholder="Ej. 75…"
                                inputMode="numeric"
                                autoComplete="off"
                                className="tabular-nums"
                                min="0"
                                max={
                                    selectedPreset?.financing_percentage
                                        ? selectedPreset.financing_percentage
                                        : 100
                                }
                                step="1"
                            />
                        </InputWithIcon>
                        <InputWithIcon
                            labelText="Plazo del Préstamo"
                            htmlFor="mortgageDuration"
                            icon={CalendarClock}
                            error={errors.mortgageDuration?.message}
                        >
                            <Select
                                {...register("mortgageDuration", {
                                    required: MORTGAGE_FIELD_ERRORS.mortgageDuration,
                                    valueAsNumber: true,
                                })}
                                id="mortgageDuration"
                                name="mortgageDuration"
                                autoComplete="off"
                                aria-invalid={errors.mortgageDuration ? true : undefined}
                                aria-describedby={
                                    errors.mortgageDuration ? "mortgageDuration-error" : undefined
                                }
                            >
                                <option value="">Seleccioná el plazo…</option>
                                {loanTermOptions.map((years) => (
                                    <option key={years} value={years}>
                                        {years} años
                                    </option>
                                ))}
                            </Select>
                        </InputWithIcon>
                        <InputWithIcon
                            labelText="Tasa de Interés"
                            htmlFor="interestRate"
                            icon={Percent}
                            error={errors.interestRate?.message}
                        >
                            <Input
                                {...register("interestRate", {
                                    required: MORTGAGE_FIELD_ERRORS.interestRate,
                                    valueAsNumber: true,
                                    min: {
                                        value: 0,
                                        message: "La tasa no puede ser negativa.",
                                    },
                                })}
                                id="interestRate"
                                name="interestRate"
                                type="number"
                                placeholder="Ej. 4.5…"
                                inputMode="decimal"
                                autoComplete="off"
                                className="tabular-nums"
                                min={
                                    selectedPreset?.interest_rate_with_salary
                                        ? selectedPreset.interest_rate_with_salary
                                        : 0
                                }
                                max={
                                    selectedPreset?.interest_rate_with_salary
                                        ? selectedPreset.interest_rate_with_salary
                                        : undefined
                                }
                                step="0.1"
                                disabled={!!selectedPreset?.interest_rate_with_salary}
                            />
                        </InputWithIcon>
                        <InputWithIcon
                            labelText="Relación Cuota/Sueldo"
                            htmlFor="salaryPaymentRatio"
                            icon={Percent}
                            error={errors.salaryPaymentRatio?.message}
                        >
                            <Input
                                {...register("salaryPaymentRatio", {
                                    required: MORTGAGE_FIELD_ERRORS.salaryPaymentRatio,
                                    valueAsNumber: true,
                                })}
                                id="salaryPaymentRatio"
                                name="salaryPaymentRatio"
                                type="number"
                                placeholder="Ej. 25…"
                                inputMode="numeric"
                                autoComplete="off"
                                className="tabular-nums"
                                min={
                                    selectedPreset?.income_to_loan_ratio
                                        ? selectedPreset.income_to_loan_ratio
                                        : 25
                                }
                                max={
                                    selectedPreset?.income_to_loan_ratio
                                        ? selectedPreset.income_to_loan_ratio
                                        : 35
                                }
                                step="5"
                                disabled={!!selectedPreset?.income_to_loan_ratio}
                            />
                        </InputWithIcon>

                        <div
                            className="col-span-full flex flex-col-reverse gap-4 pt-2 sm:flex-row sm:items-start sm:justify-between"
                            aria-live="polite"
                            aria-atomic="true"
                        >
                            {submitError ? (
                                <p
                                    role="alert"
                                    className="flex-1 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive ring-1 ring-destructive/20"
                                >
                                    {submitError}
                                </p>
                            ) : (
                                <span className="sr-only">Sin errores de envío</span>
                            )}
                            <Button
                                type="submit"
                                variant="cta"
                                size="lg"
                                className="w-full shrink-0 sm:ml-auto sm:w-auto sm:min-w-[160px]"
                                disabled={isSubmitting || ratesLoading}
                                aria-busy={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="animate-spin" aria-hidden="true" />
                                        Calculando…
                                    </>
                                ) : (
                                    "Calcular"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
