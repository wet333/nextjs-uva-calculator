import { getDollarPrice } from "@/lib/currencies";

export function calculatePaymentsArs(annualRate, loanAmountUsd, loanDurationYears) {
    const monthlyRate = annualRate / 12 / 100;
    const totalPayments = loanDurationYears * 12;
    const dollarPrice = getDollarPrice();

    const monthlyPaymentUsd =
        (loanAmountUsd * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);

    const totalToPayUsd = monthlyPaymentUsd * totalPayments;

    return {
        monthlyPayment: monthlyPaymentUsd * dollarPrice,
        totalToPay: totalToPayUsd * dollarPrice,
    };
}
