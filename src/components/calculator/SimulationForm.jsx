"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Briefcase, CalendarClock, Home, Loader2, PiggyBank } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { InputWithIcon } from "@/components/forms/InputWithIcon";
import { CurrencyAmountInput } from "@/components/forms/CurrencyAmountInput";
import { ToggleSwitch } from "@/components/forms/ToggleSwitch";
import { SimulationGoalPicker } from "@/components/forms/SimulationGoalPicker";
import { useRates } from "@/components/providers/RatesProvider";
import {
    LOAN_TERM_OPTIONS,
    MORTGAGE_FIELD_ERRORS,
    MORTGAGE_FORM_DEFAULTS,
    SAVINGS_MODE_REDUCE,
} from "@/constants/mortgage-form";

// En pantallas medianas en adelante los campos bajan de 40 a 36px; en mobile quedan en 40px
// para que sigan siendo cómodos de tocar.
const COMPACT_FIELDS =
    "sm:[&_.currency-toggle]:h-9 sm:[&_.field-control]:h-9 sm:[&_.field-icon]:h-9";

export function SimulationForm({
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
    liveUpdates,
    onScenarioChange,
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

    const [salary, salaryCurrency, savings, savingsCurrency, salaryAccount] = useWatch({
        control,
        name: ["salary", "salaryCurrency", "savings", "savingsCurrency", "salaryAccount"],
    });

    // Después del primer cálculo, cada cambio válido actualiza el resultado al instante
    // (plazo, modo y precio ya lo hacían; así todo el escenario se comporta igual).
    useEffect(() => {
        if (!liveUpdates || !(Number(salary) > 0) || !(Number(savings) > 0)) {
            return;
        }
        onScenarioChange({ salary, salaryCurrency, savings, savingsCurrency, salaryAccount });
    }, [
        liveUpdates,
        onScenarioChange,
        salary,
        salaryCurrency,
        savings,
        savingsCurrency,
        salaryAccount,
    ]);

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
                    Con tu sueldo y tus ahorros calculamos cuánto te presta cada banco.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
                <form
                    onSubmit={handleSubmit(onSubmit, onInvalid)}
                    noValidate
                    className={`space-y-5 ${COMPACT_FIELDS}`}
                >
                    <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 lg:gap-x-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)]">
                        <InputWithIcon
                            labelText="Sueldo neto mensual"
                            htmlFor="salary"
                            icon={Briefcase}
                            helpMsg="Ingreso neto mensual del grupo familiar que declararías al banco."
                            error={errors.salary?.message}
                        >
                            <Controller
                                name="salary"
                                control={control}
                                rules={{
                                    required: MORTGAGE_FIELD_ERRORS.salary,
                                    min: { value: 1, message: "El sueldo debe ser mayor a 0." },
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
                                                        ? "Ej. 2.500"
                                                        : "Ej. 2.500.000"
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
                            labelText="Ahorros"
                            htmlFor="savings"
                            icon={PiggyBank}
                            helpMsg="Dinero que tenés disponible para la compra. Abajo elegís cómo se usa."
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
                                                        ? "Ej. 40.000"
                                                        : "Ej. 40.000.000"
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
                            labelText="Plazo"
                            htmlFor="termYears"
                            icon={CalendarClock}
                            helpMsg="Cada banco usa este plazo o su máximo, el que sea menor. Más plazo baja la cuota y permite pedir más."
                            error={errors.termYears?.message}
                        >
                            <Controller
                                name="termYears"
                                control={control}
                                rules={{ required: MORTGAGE_FIELD_ERRORS.termYears }}
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
                        <InputWithIcon
                            labelText="Acredito haberes"
                            htmlFor="salaryAccount"
                            helpMsg="Si cobrás el sueldo en el banco que te presta, suele aplicar una tasa más baja."
                        >
                            <Controller
                                name="salaryAccount"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex h-10 items-center gap-2.5 rounded-lg bg-white/[0.02] px-3 ring-1 ring-white/[0.06] sm:h-9">
                                        <ToggleSwitch
                                            id="salaryAccount"
                                            checked={field.value}
                                            onChange={field.onChange}
                                        />
                                        <span
                                            className="text-sm text-foreground"
                                            aria-hidden="true"
                                        >
                                            {field.value ? "Sí" : "No"}
                                        </span>
                                    </div>
                                )}
                            />
                        </InputWithIcon>
                    </div>

                    <div className="border-t border-white/[0.05] pt-4">
                        <Controller
                            name="savingsMode"
                            control={control}
                            render={({ field }) => (
                                <SimulationGoalPicker
                                    id="savingsMode"
                                    value={field.value}
                                    onChange={(nextValue) => {
                                        field.onChange(nextValue);
                                        onSavingsModeChange(nextValue);
                                    }}
                                    savings={savings}
                                    savingsCurrency={savingsCurrency}
                                    propertyValue={propertyValue}
                                    propertyCurrency={propertyCurrency}
                                >
                                    {isReduceMode ? (
                                        <div className="sm:max-w-md">
                                            <InputWithIcon
                                                labelText="Precio de la casa"
                                                htmlFor="propertyValue"
                                                icon={Home}
                                                helpMsg="El precio publicado de la casa que viste. Tus ahorros tienen que cubrir al menos el anticipo mínimo de cada banco."
                                                error={errors.propertyValue?.message}
                                            >
                                                <Controller
                                                    name="propertyValue"
                                                    control={control}
                                                    rules={{
                                                        required:
                                                            MORTGAGE_FIELD_ERRORS.propertyValue,
                                                        min: {
                                                            value: 1,
                                                            message:
                                                                "El precio debe ser mayor a 0.",
                                                        },
                                                    }}
                                                    render={({ field: priceField }) => (
                                                        <Controller
                                                            name="propertyCurrency"
                                                            control={control}
                                                            render={({ field: currencyField }) => (
                                                                <CurrencyAmountInput
                                                                    id="propertyValue"
                                                                    name="propertyValue"
                                                                    value={priceField.value}
                                                                    onChange={(nextValue) => {
                                                                        priceField.onChange(
                                                                            nextValue
                                                                        );
                                                                        onPropertyValueChange(
                                                                            nextValue
                                                                        );
                                                                    }}
                                                                    onBlur={priceField.onBlur}
                                                                    inputRef={priceField.ref}
                                                                    currency={currencyField.value}
                                                                    onCurrencyChange={(
                                                                        nextCurrency
                                                                    ) => {
                                                                        currencyField.onChange(
                                                                            nextCurrency
                                                                        );
                                                                        onPropertyCurrencyChange(
                                                                            nextCurrency
                                                                        );
                                                                    }}
                                                                    placeholder={
                                                                        currencyField.value ===
                                                                        "USD"
                                                                            ? "Ej. 100.000"
                                                                            : "Ej. 150.000.000"
                                                                    }
                                                                    invalid={!!errors.propertyValue}
                                                                    describedBy={
                                                                        errors.propertyValue
                                                                            ? "propertyValue-error"
                                                                            : undefined
                                                                    }
                                                                    currencyLabelledBy="propertyValue"
                                                                    currencyGroupLabel="Moneda del precio"
                                                                />
                                                            )}
                                                        />
                                                    )}
                                                />
                                            </InputWithIcon>
                                        </div>
                                    ) : null}
                                </SimulationGoalPicker>
                            )}
                        />
                    </div>

                    <div
                        className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between"
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
                </form>
            </CardContent>
        </Card>
    );
}
