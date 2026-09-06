import { arsToUva, usdToArs, usdToUva } from "@/lib/currency-conversions";
import { compareBankRows, evaluateBankAffordability } from "@/lib/mortgage/affordability";
import { getBankPresets } from "@/lib/mortgage/bank-presets";

function amountToUva(amount, currency) {
    return currency === "USD" ? usdToUva(amount) : arsToUva(amount);
}

function amountToArs(amount, currency) {
    return currency === "USD" ? usdToArs(amount) : amount;
}

export function buildBankComparisons(scenario) {
    const salaryUva = amountToUva(scenario.salary, scenario.salaryCurrency);
    const salaryArs = amountToArs(scenario.salary, scenario.salaryCurrency);
    const savingsUva = amountToUva(scenario.savings, scenario.savingsCurrency);
    const targetPropertyUva =
        scenario.propertyValue && Number(scenario.propertyValue) > 0
            ? amountToUva(scenario.propertyValue, scenario.propertyCurrency ?? "USD")
            : null;

    return getBankPresets()
        .map((bank) =>
            evaluateBankAffordability({
                bank,
                salaryUva,
                salaryArs,
                savingsUva,
                salaryAccount: scenario.salaryAccount,
                extraInstallmentsPerYear: scenario.extraInstallmentsPerYear ?? 0,
                extraStepIndex: scenario.extraStepIndex ?? 0,
                requestedTermYears: scenario.termYears,
                savingsMode: scenario.savingsMode ?? "expand",
                targetPropertyUva,
            })
        )
        .sort(compareBankRows);
}
