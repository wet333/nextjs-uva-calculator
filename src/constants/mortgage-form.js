export const MORTGAGE_FIELD_ERRORS = {
    salary: "Ingresá tu sueldo neto mensual.",
    savings: "Ingresá tus ahorros disponibles para el anticipo.",
    termYears: "Seleccioná el plazo del préstamo.",
    propertyValue: "Ingresá el valor de la propiedad que querés comprar.",
};

export const LOAN_TERM_OPTIONS = [5, 10, 15, 20, 25, 30];
export const DEFAULT_TERM_YEARS = 20;

export const EXTRA_PAYMENT_STEPS = [
    { extrasPerYear: 0, label: "Sin adelantos", shortLabel: "0" },
    { extrasPerYear: 1, label: "1 extra cada 12 meses", shortLabel: "1/año" },
    { extrasPerYear: 2, label: "1 extra cada 6 meses", shortLabel: "1/6m" },
    { extrasPerYear: 3, label: "1 extra cada 4 meses", shortLabel: "1/4m" },
    { extrasPerYear: 4, label: "1 extra cada 3 meses", shortLabel: "1/3m" },
    { extrasPerYear: 6, label: "1 extra cada 2 meses", shortLabel: "1/2m" },
    { extrasPerYear: 12, label: "1 extra por mes", shortLabel: "1/mes" },
    { extrasPerYear: 24, label: "2 extras por mes", shortLabel: "2/mes" },
    { extrasPerYear: 36, label: "3 extras por mes", shortLabel: "3/mes" },
    { extrasPerYear: 48, label: "4 extras por mes", shortLabel: "4/mes" },
];

export const EXTRA_STEP_MIN = 0;
export const EXTRA_STEP_MAX = EXTRA_PAYMENT_STEPS.length - 1;

export function getExtraPaymentStep(index) {
    const safeIndex = Number.isInteger(index) ? index : 0;
    return EXTRA_PAYMENT_STEPS[safeIndex] ?? EXTRA_PAYMENT_STEPS[0];
}

export function extrasPerYearFromStep(index) {
    return getExtraPaymentStep(index).extrasPerYear;
}

export function extraStepLabel(index) {
    return getExtraPaymentStep(index).label;
}

export const SAVINGS_MODE_EXPAND = "expand";
export const SAVINGS_MODE_REDUCE = "reduce";
export const DEFAULT_SAVINGS_MODE = SAVINGS_MODE_EXPAND;

export const MORTGAGE_FORM_DEFAULTS = {
    salary: "",
    salaryCurrency: "ARS",
    savings: "",
    savingsCurrency: "USD",
    salaryAccount: true,
    termYears: DEFAULT_TERM_YEARS,
    extraStepIndex: 0,
    savingsMode: DEFAULT_SAVINGS_MODE,
    propertyValue: "",
    propertyCurrency: "USD",
};
