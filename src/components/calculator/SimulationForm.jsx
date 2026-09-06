"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Briefcase, CalendarClock, Home, Loader2, PiggyBank } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { InputWithIcon } from "@/components/forms/InputWithIcon";
import { CurrencyAmountInput } from "@/components/forms/CurrencyAmountInput";
import { ToggleSwitch } from "@/components/forms/ToggleSwitch";
import { useRates } from "@/components/providers/RatesProvider";
import { ExtraInstallmentsSlider } from "@/components/forms/ExtraInstallmentsSlider";
import { SavingsModeToggle } from "@/components/forms/SavingsModeToggle";
import {
    LOAN_TERM_OPTIONS,
    MORTGAGE_FIELD_ERRORS,
    MORTGAGE_FORM_DEFAULTS,
    SAVINGS_MODE_REDUCE,
} from "@/constants/mortgage-form";

export function SimulationForm({
    extraStepIndex,
    onExtraStepChange,
    termYears,
    onTermYearsChange,
    savingsMode,
    onSavingsModeChange,
    propertyValue,
    propertyCurrency,
    onPropertyValueChange,
    onPropertyCurrencyChange,
    onSubmit,
    submitError,
}) {
    const { loading: ratesLoading } = useRates();

    const {
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
        setFocus,
        setValue,
    } = useForm({
        defaultValues: MORTGAGE_FORM_DEFAULTS,
    });

    useEffect(() => {
        setValue("extraStepIndex", extraStepIndex);
    }, [extraStepIndex, setValue]);

    useEffect(() => {
        setValue("termYears", termYears);
    }, [termYears, setValue]);

    useEffect(() => {
        setValue("savingsMode", savingsMode);
    }, [savingsMode, setValue]);

    useEffect(() => {
        setValue("propertyValue", propertyValue);
    }, [propertyValue, setValue]);

    useEffect(() => {
        setValue("propertyCurrency", propertyCurrency);
    }, [propertyCurrency, setValue]);

    const isReduceMode = savingsMode === SAVINGS_MODE_REDUCE;

    const onInvalid = (invalidErrors) => {
        const firstKey = Object.keys(invalidErrors)[0];
        if (firstKey) {
            setFocus(firstKey);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle tag="h2">Tu escenario</CardTitle>
                <CardDescription>
                    {isReduceMode
                        ? "Ingresá sueldo, ahorros y el valor de la propiedad. Los ahorros bajan lo que pedís al banco."
                        : "Ingresá sueldo y ahorros para ver cuánto podrías pedir en cada banco, cuánto recibís y cuánto terminás devolviendo."}
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
                    <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
                        <InputWithIcon
                            labelText="Sueldo neto mensual"
                            htmlFor="salary"
                            icon={Briefcase}
                            helpMsg="Ingreso neto mensual del grupo familiar que declararías al banco. Podés expresarlo en pesos o dólares."
                            error={errors.salary?.message}
                        >
                            <Controller
                                name="salary"
                                control={control}
                                rules={{
                                    required: MORTGAGE_FIELD_ERRORS.salary,
                                    min: {
                                        value: 1,
                                        message: "El sueldo debe ser mayor a 0.",
                                    },
                                }}
                                render={({ field }) => (
                                    <Controller
                                        name="salaryCurrency"
                                        control={control}
                                        render={({ field: currencyField }) => (
                                            <CurrencyAmountInput
                                                id="salary"
                                                name="salary"
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                inputRef={field.ref}
                                                currency={currencyField.value}
                                                onCurrencyChange={currencyField.onChange}
                                                placeholder={
                                                    currencyField.value === "USD"
                                                        ? "Ej. 2.500…"
                                                        : "Ej. 2.500.000…"
                                                }
                                                invalid={!!errors.salary}
                                                describedBy={
                                                    errors.salary ? "salary-error" : undefined
                                                }
                                                currencyLabelledBy="salary"
                                                currencyGroupLabel="Moneda del sueldo"
                                            />
                                        )}
                                    />
                                )}
                            />
                        </InputWithIcon>
                        <InputWithIcon
                            labelText="Ahorros disponibles"
                            htmlFor="savings"
                            icon={PiggyBank}
                            helpMsg={
                                isReduceMode
                                    ? "Se restan del valor de la propiedad: eso es lo que pedís al banco, si alcanza el anticipo mínimo."
                                    : "Capital para el anticipo. Si cubrís lo que el banco no financia, el resto suma al valor de la propiedad."
                            }
                            error={errors.savings?.message}
                        >
                            <Controller
                                name="savings"
                                control={control}
                                rules={{
                                    required: MORTGAGE_FIELD_ERRORS.savings,
                                    min: {
                                        value: 1,
                                        message: "Los ahorros deben ser mayores a 0.",
                                    },
                                }}
                                render={({ field }) => (
                                    <Controller
                                        name="savingsCurrency"
                                        control={control}
                                        render={({ field: currencyField }) => (
                                            <CurrencyAmountInput
                                                id="savings"
                                                name="savings"
                                                value={field.value}
                                                onChange={field.onChange}
                                                onBlur={field.onBlur}
                                                inputRef={field.ref}
                                                currency={currencyField.value}
                                                onCurrencyChange={currencyField.onChange}
                                                placeholder={
                                                    currencyField.value === "USD"
                                                        ? "Ej. 40.000…"
                                                        : "Ej. 40.000.000…"
                                                }
                                                invalid={!!errors.savings}
                                                describedBy={
                                                    errors.savings ? "savings-error" : undefined
                                                }
                                                currencyLabelledBy="savings"
                                                currencyGroupLabel="Moneda de los ahorros"
                                            />
                                        )}
                                    />
                                )}
                            />
                        </InputWithIcon>
                        <InputWithIcon
                            labelText="Plazo del préstamo"
                            htmlFor="termYears"
                            icon={CalendarClock}
                            helpMsg="Cada banco usa este plazo o el máximo que ofrece, el que sea menor. Un plazo más largo baja la cuota y permite pedir más."
                            error={errors.termYears?.message}
                        >
                            <Controller
                                name="termYears"
                                control={control}
                                rules={{
                                    required: MORTGAGE_FIELD_ERRORS.termYears,
                                }}
                                render={({ field }) => (
                                    <Select
                                        id="termYears"
                                        name="termYears"
                                        value={field.value}
                                        onChange={(event) => {
                                            const nextValue = Number(event.target.value);
                                            field.onChange(nextValue);
                                            onTermYearsChange(nextValue);
                                        }}
                                        onBlur={field.onBlur}
                                        ref={field.ref}
                                        aria-invalid={errors.termYears ? true : undefined}
                                        aria-describedby={
                                            errors.termYears ? "termYears-error" : undefined
                                        }
                                    >
                                        {LOAN_TERM_OPTIONS.map((years) => (
                                            <option key={years} value={years}>
                                                {years} años
                                            </option>
                                        ))}
                                    </Select>
                                )}
                            />
                        </InputWithIcon>
                        <div className="rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.05]">
                            <Controller
                                name="salaryAccount"
                                control={control}
                                render={({ field }) => (
                                    <ToggleSwitch
                                        id="salaryAccount"
                                        checked={field.value}
                                        onChange={field.onChange}
                                        label="Acredito haberes"
                                        description="Si cobrás el sueldo en el banco, suele aplicar una tasa más baja."
                                    />
                                )}
                            />
                        </div>
                        <div className="col-span-full rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.05]">
                            <Controller
                                name="savingsMode"
                                control={control}
                                render={({ field }) => (
                                    <SavingsModeToggle
                                        id="savingsMode"
                                        value={field.value}
                                        onChange={(nextValue) => {
                                            field.onChange(nextValue);
                                            onSavingsModeChange(nextValue);
                                        }}
                                    />
                                )}
                            />
                        </div>
                        {isReduceMode ? (
                            <div className="col-span-full">
                                <InputWithIcon
                                    labelText="Valor de la propiedad"
                                    htmlFor="propertyValue"
                                    icon={Home}
                                    helpMsg="El inmueble que querés comprar. El préstamo es este valor menos tus ahorros, si el banco y tu sueldo alcanzan."
                                    error={errors.propertyValue?.message}
                                >
                                    <Controller
                                        name="propertyValue"
                                        control={control}
                                        rules={{
                                            required: isReduceMode
                                                ? MORTGAGE_FIELD_ERRORS.propertyValue
                                                : false,
                                            min: isReduceMode
                                                ? {
                                                      value: 1,
                                                      message: "El valor debe ser mayor a 0.",
                                                  }
                                                : undefined,
                                        }}
                                        render={({ field }) => (
                                            <Controller
                                                name="propertyCurrency"
                                                control={control}
                                                render={({ field: currencyField }) => (
                                                    <CurrencyAmountInput
                                                        id="propertyValue"
                                                        name="propertyValue"
                                                        value={field.value}
                                                        onChange={(nextValue) => {
                                                            field.onChange(nextValue);
                                                            onPropertyValueChange(nextValue);
                                                        }}
                                                        onBlur={field.onBlur}
                                                        inputRef={field.ref}
                                                        currency={currencyField.value}
                                                        onCurrencyChange={(nextCurrency) => {
                                                            currencyField.onChange(nextCurrency);
                                                            onPropertyCurrencyChange(nextCurrency);
                                                        }}
                                                        placeholder={
                                                            currencyField.value === "USD"
                                                                ? "Ej. 100.000…"
                                                                : "Ej. 150.000.000…"
                                                        }
                                                        invalid={!!errors.propertyValue}
                                                        describedBy={
                                                            errors.propertyValue
                                                                ? "propertyValue-error"
                                                                : undefined
                                                        }
                                                        currencyLabelledBy="propertyValue"
                                                        currencyGroupLabel="Moneda de la propiedad"
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                </InputWithIcon>
                            </div>
                        ) : null}
                        <div className="col-span-full rounded-lg bg-white/[0.02] px-4 py-3 ring-1 ring-white/[0.05]">
                            <Controller
                                name="extraStepIndex"
                                control={control}
                                render={({ field }) => (
                                    <ExtraInstallmentsSlider
                                        id="extraStepIndex"
                                        value={field.value}
                                        onChange={(nextValue) => {
                                            field.onChange(nextValue);
                                            onExtraStepChange(nextValue);
                                        }}
                                    />
                                )}
                            />
                        </div>
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
                                    "Comparar bancos"
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
