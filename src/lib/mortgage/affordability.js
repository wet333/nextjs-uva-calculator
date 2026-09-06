import { arsToUva } from "@/lib/currency-conversions";
import {
    extraPaymentFromInstallments,
    frenchMonthlyPayment,
    maxPrincipalFromPayment,
    simulateAmortization,
} from "@/lib/mortgage/amortization";
import { formatArs } from "@/lib/utils";

export const DEFAULT_INCOME_RATIO = 25;

export function resolveBankRate(bank, salaryAccount) {
    if (salaryAccount) {
        return bank.interest_rate_with_salary ?? null;
    }

    return bank.interest_rate_without_salary ?? null;
}

export function resolveTermYears(requestedTermYears, bankMaxYears) {
    const requested = Number(requestedTermYears);
    const bankMax = Number(bankMaxYears);

    if (!Number.isFinite(requested) || requested <= 0) {
        return bankMax;
    }

    return Math.min(requested, bankMax);
}

export function maxLoanAllowedBySavings(savingsUva, financingPercentage) {
    if (financingPercentage >= 100) {
        return Number.POSITIVE_INFINITY;
    }

    if (financingPercentage <= 0 || savingsUva <= 0) {
        return 0;
    }

    return (savingsUva * financingPercentage) / (100 - financingPercentage);
}

const LOAN_EPSILON = 1e-6;

export function applyReduceAgainstProperty({
    propertyUva,
    savingsUva,
    financingPercentage,
    maxLoanFromIncome,
    bankCapUva,
}) {
    if (!(propertyUva > 0) || !Number.isFinite(propertyUva)) {
        return {
            loanUva: 0,
            propertyUva: 0,
            surplusApplied: false,
            rejectReason: "missing_property",
        };
    }

    if (savingsUva >= propertyUva) {
        return {
            loanUva: 0,
            propertyUva,
            surplusApplied: true,
            rejectReason: "no_loan_needed",
        };
    }

    const minDownUva =
        financingPercentage >= 100
            ? 0
            : financingPercentage <= 0
              ? propertyUva
              : propertyUva * (1 - financingPercentage / 100);

    if (savingsUva + LOAN_EPSILON < minDownUva) {
        return {
            loanUva: 0,
            propertyUva,
            surplusApplied: false,
            rejectReason: "insufficient_down",
        };
    }

    const desiredLoanUva = propertyUva - savingsUva;
    const creditCap = Math.min(maxLoanFromIncome, bankCapUva ?? Number.POSITIVE_INFINITY);

    if (
        !(creditCap > 0) ||
        !Number.isFinite(creditCap) ||
        creditCap + LOAN_EPSILON < desiredLoanUva
    ) {
        const incomeBinds =
            !(maxLoanFromIncome > 0) || maxLoanFromIncome + LOAN_EPSILON < desiredLoanUva;
        const bankBinds = bankCapUva != null && bankCapUva + LOAN_EPSILON < desiredLoanUva;

        return {
            loanUva: 0,
            propertyUva,
            surplusApplied: savingsUva > minDownUva,
            rejectReason: bankBinds && !incomeBinds ? "bank_cap" : "income",
        };
    }

    return {
        loanUva: desiredLoanUva,
        propertyUva,
        surplusApplied: savingsUva > minDownUva + LOAN_EPSILON,
        rejectReason: null,
    };
}

export function applySavingsAllocation({
    savingsUva,
    financingPercentage,
    maxLoanFromIncome,
    maxLoanFromSavings,
    bankCapUva,
    savingsMode = "expand",
    targetPropertyUva,
}) {
    if (savingsMode === "reduce") {
        return applyReduceAgainstProperty({
            propertyUva: targetPropertyUva,
            savingsUva,
            financingPercentage,
            maxLoanFromIncome,
            bankCapUva,
        });
    }

    const creditCap = Math.min(maxLoanFromIncome, bankCapUva ?? Number.POSITIVE_INFINITY);

    if (!(creditCap > 0) || !Number.isFinite(creditCap) || financingPercentage <= 0) {
        const loanUva = Number.isFinite(maxLoanFromSavings) ? maxLoanFromSavings : 0;
        return {
            loanUva,
            propertyUva: loanUva + savingsUva,
            surplusApplied: false,
            rejectReason: null,
        };
    }

    const propertyAtMaxLtv = creditCap / (financingPercentage / 100);
    const minDownUva = Math.max(0, propertyAtMaxLtv - creditCap);
    const surplusApplied = savingsUva >= minDownUva;

    if (!surplusApplied) {
        const loanUva = Number.isFinite(maxLoanFromSavings) ? maxLoanFromSavings : 0;
        return {
            loanUva,
            propertyUva: loanUva + savingsUva,
            surplusApplied: false,
            rejectReason: null,
        };
    }

    return {
        loanUva: creditCap,
        propertyUva: creditCap + savingsUva,
        surplusApplied: true,
        rejectReason: null,
    };
}

function pickLimitingFactor(maxLoanFromIncome, bankCapUva, surplusApplied) {
    if (!surplusApplied) {
        return "savings";
    }

    const parts = [{ factor: "income", value: maxLoanFromIncome }];

    if (bankCapUva != null) {
        parts.push({ factor: "bank_cap", value: bankCapUva });
    }

    return parts.reduce((lowest, part) => (part.value < lowest.value ? part : lowest)).factor;
}

function emptyBankResult(bank, rate, ratio, reasons, extras = {}) {
    const termYears = extras.termYears ?? bank.loan_term_years;

    return {
        bankName: bank.name,
        bank,
        eligible: false,
        ineligibleReasons: reasons,
        rate,
        ratio,
        financingPercentage: bank.financing_percentage,
        effectiveFinancingPercentage: 0,
        requestedTermYears: extras.requestedTermYears ?? termYears,
        termYears,
        termMonths: termYears * 12,
        termCapped: extras.termCapped ?? false,
        maxLoanUva: 0,
        propertyUva: extras.propertyUva ?? extras.targetPropertyUva ?? 0,
        downPaymentUva: extras.downPaymentUva ?? 0,
        maxPaymentUva: extras.maxPaymentUva ?? 0,
        paymentUva: 0,
        limitingFactor: null,
        extraInstallmentsPerYear: extras.extraInstallmentsPerYear ?? 0,
        extraStepIndex: extras.extraStepIndex ?? 0,
        savingsMode: extras.savingsMode ?? "expand",
        surplusApplied: extras.surplusApplied ?? false,
        targetPropertyUva: extras.targetPropertyUva ?? 0,
        amortization: null,
    };
}

export function evaluateBankAffordability({
    bank,
    salaryUva,
    salaryArs,
    savingsUva,
    salaryAccount,
    extraInstallmentsPerYear = 0,
    extraStepIndex = 0,
    requestedTermYears,
    savingsMode = "expand",
    targetPropertyUva,
}) {
    const rate = resolveBankRate(bank, salaryAccount);
    const ratio = bank.income_to_loan_ratio ?? DEFAULT_INCOME_RATIO;
    const financingPercentage = bank.financing_percentage;
    const termYears = resolveTermYears(requestedTermYears, bank.loan_term_years);
    const termMonths = termYears * 12;
    const termCapped = termYears < Number(requestedTermYears);
    const reasons = [];
    const sharedExtras = {
        requestedTermYears: requestedTermYears ?? termYears,
        termYears,
        termCapped,
        extraInstallmentsPerYear,
        extraStepIndex,
        savingsMode,
        targetPropertyUva: targetPropertyUva ?? 0,
    };

    if (rate == null) {
        reasons.push(
            salaryAccount
                ? "Este banco no publica tasa con acreditación de haberes."
                : "Este banco no publica tasa sin acreditación de haberes."
        );

        return emptyBankResult(bank, rate, ratio, reasons, sharedExtras);
    }

    if (bank.minimum_income != null && salaryArs < bank.minimum_income) {
        reasons.push(`Ingreso mínimo ${formatArs(bank.minimum_income)}.`);
    }

    const maxPaymentUva = salaryUva * (ratio / 100);
    const maxLoanFromIncome = maxPrincipalFromPayment(maxPaymentUva, rate, termMonths);
    const maxLoanFromSavings = maxLoanAllowedBySavings(savingsUva, financingPercentage);
    const bankCapUva = bank.loan_amount_ars != null ? arsToUva(bank.loan_amount_ars) : null;
    const allocation = applySavingsAllocation({
        savingsUva,
        financingPercentage,
        maxLoanFromIncome,
        maxLoanFromSavings,
        bankCapUva,
        savingsMode,
        targetPropertyUva,
    });
    const maxLoanUva = allocation.loanUva;
    const propertyUva = allocation.propertyUva;

    if (!(maxLoanUva > 0) || !Number.isFinite(maxLoanUva)) {
        if (allocation.rejectReason === "missing_property") {
            reasons.push("Ingresá el valor de la propiedad para quitar financiación.");
        } else if (allocation.rejectReason === "no_loan_needed") {
            reasons.push("Con estos ahorros cubrís el valor de la propiedad sin préstamo.");
        } else if (allocation.rejectReason === "insufficient_down") {
            reasons.push(
                `Faltan ahorros para el anticipo de esta propiedad (financia hasta el ${financingPercentage}%).`
            );
        } else if (allocation.rejectReason === "bank_cap") {
            reasons.push("El tope del banco no cubre lo que falta para esta propiedad.");
        } else if (allocation.rejectReason === "income") {
            reasons.push("El sueldo no alcanza para financiar esta propiedad.");
        } else if (allocation.surplusApplied && propertyUva > 0) {
            reasons.push("Con estos ahorros cubrís la casa a LTV máximo sin préstamo.");
        } else if (savingsUva <= 0) {
            reasons.push(
                `Necesitás ahorros para el anticipo (financia hasta el ${financingPercentage}%).`
            );
        } else if (maxLoanFromIncome <= 0) {
            reasons.push("El sueldo no alcanza para una cuota inicial.");
        } else {
            reasons.push("No se pudo calcular un monto financiable.");
        }

        return emptyBankResult(bank, rate, ratio, reasons, {
            ...sharedExtras,
            maxPaymentUva,
            surplusApplied: allocation.surplusApplied,
            propertyUva,
            targetPropertyUva: propertyUva || targetPropertyUva || 0,
            downPaymentUva: savingsUva,
        });
    }

    const downPaymentUva = savingsUva;
    const effectiveFinancingPercentage = propertyUva > 0 ? (maxLoanUva / propertyUva) * 100 : 0;
    const basePaymentUva = frenchMonthlyPayment(maxLoanUva, rate, termMonths);
    const extraPaymentUva = extraPaymentFromInstallments(basePaymentUva, extraInstallmentsPerYear);
    const amortization = simulateAmortization({
        principalUva: maxLoanUva,
        annualRatePct: rate,
        termMonths,
        extraPaymentUva,
    });

    return {
        bankName: bank.name,
        bank,
        eligible: reasons.length === 0,
        ineligibleReasons: reasons,
        rate,
        ratio,
        financingPercentage,
        effectiveFinancingPercentage,
        requestedTermYears: requestedTermYears ?? termYears,
        termYears,
        termMonths,
        termCapped,
        maxLoanUva,
        propertyUva,
        downPaymentUva,
        maxPaymentUva,
        paymentUva: amortization.basePaymentUva,
        limitingFactor:
            savingsMode === "reduce"
                ? "property"
                : pickLimitingFactor(maxLoanFromIncome, bankCapUva, allocation.surplusApplied),
        extraInstallmentsPerYear,
        extraStepIndex,
        savingsMode,
        surplusApplied: allocation.surplusApplied,
        targetPropertyUva: targetPropertyUva ?? propertyUva,
        amortization,
    };
}

export function compareBankRows(a, b) {
    if (a.eligible !== b.eligible) {
        return a.eligible ? -1 : 1;
    }

    if (b.maxLoanUva !== a.maxLoanUva) {
        return b.maxLoanUva - a.maxLoanUva;
    }

    return (a.rate ?? Infinity) - (b.rate ?? Infinity);
}
