import { arsToUva, usdToUva } from "@/lib/currency-conversions";

function calculateRequiredSavingsUsd(values) {
    return values.propertyValue * ((100 - values.financialPercentage) / 100);
}

function calculateLoanAmountUsd(values) {
    return values.propertyValue * (values.financialPercentage / 100);
}

function calculateMinimumSalary(monthlyPaymentArs, ratio) {
    return monthlyPaymentArs / (ratio / 100);
}

export function buildSimulationResults(values, paymentCalculations) {
    return [
        {
            title: "Valor de Cuota",
            uvaAmount: arsToUva(paymentCalculations.monthlyPayment),
        },
        {
            title: "Ahorros Necesarios",
            uvaAmount: usdToUva(calculateRequiredSavingsUsd(values)),
        },
        {
            title: "Monto a Recibir",
            uvaAmount: usdToUva(calculateLoanAmountUsd(values)),
        },
        {
            title: "Total a Pagar",
            uvaAmount: arsToUva(paymentCalculations.totalToPay),
        },
        {
            title: "Sueldo Requerido",
            uvaAmount: arsToUva(
                calculateMinimumSalary(
                    paymentCalculations.monthlyPayment,
                    values.salaryPaymentRatio
                )
            ),
        },
    ];
}
