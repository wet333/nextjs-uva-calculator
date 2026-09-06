const BALANCE_EPSILON = 1e-8;

export function monthlyRateFromAnnual(annualRatePct) {
    return Number(annualRatePct) / 12 / 100;
}

export function frenchMonthlyPayment(principal, annualRatePct, termMonths) {
    if (!principal || principal <= 0 || !termMonths || termMonths <= 0) {
        return 0;
    }

    const monthlyRate = monthlyRateFromAnnual(annualRatePct);

    if (monthlyRate === 0) {
        return principal / termMonths;
    }

    const factor = Math.pow(1 + monthlyRate, termMonths);
    return (principal * (monthlyRate * factor)) / (factor - 1);
}

export function maxPrincipalFromPayment(payment, annualRatePct, termMonths) {
    if (!payment || payment <= 0 || !termMonths || termMonths <= 0) {
        return 0;
    }

    const monthlyRate = monthlyRateFromAnnual(annualRatePct);

    if (monthlyRate === 0) {
        return payment * termMonths;
    }

    const factor = Math.pow(1 + monthlyRate, termMonths);
    return (payment * (factor - 1)) / (monthlyRate * factor);
}

export function extraPaymentFromInstallments(basePaymentUva, extraInstallmentsPerYear) {
    if (!basePaymentUva || extraInstallmentsPerYear <= 0) {
        return 0;
    }

    return (extraInstallmentsPerYear / 12) * basePaymentUva;
}

function runSchedule(principalUva, annualRatePct, termMonths, extraPaymentUva, basePaymentUva) {
    const monthlyRate = monthlyRateFromAnnual(annualRatePct);
    let balance = principalUva;
    let totalPaidUva = 0;
    let totalInterestUva = 0;
    let monthsToPayoff = 0;

    while (balance > BALANCE_EPSILON && monthsToPayoff < termMonths) {
        monthsToPayoff += 1;
        const interest = balance * monthlyRate;
        const remaining = balance + interest;
        const scheduledPayment =
            monthsToPayoff === termMonths ? remaining : basePaymentUva + extraPaymentUva;
        const payment = Math.min(scheduledPayment, remaining);
        const principalPaid = payment - interest;

        balance = Math.max(0, balance - principalPaid);
        totalPaidUva += payment;
        totalInterestUva += Math.max(0, interest);
    }

    return {
        monthsToPayoff,
        totalPaidUva,
        totalInterestUva,
    };
}

export function simulateAmortization({
    principalUva,
    annualRatePct,
    termMonths,
    extraPaymentUva = 0,
}) {
    const basePaymentUva = frenchMonthlyPayment(principalUva, annualRatePct, termMonths);

    if (basePaymentUva <= 0) {
        return {
            basePaymentUva: 0,
            monthsToPayoff: 0,
            totalPaidUva: 0,
            totalInterestUva: 0,
            monthsSaved: 0,
            interestSavedUva: 0,
            scheduledMonths: 0,
            scheduledTotalPaidUva: 0,
            scheduledTotalInterestUva: 0,
        };
    }

    const scheduled = runSchedule(principalUva, annualRatePct, termMonths, 0, basePaymentUva);
    const withExtra =
        extraPaymentUva > 0
            ? runSchedule(principalUva, annualRatePct, termMonths, extraPaymentUva, basePaymentUva)
            : scheduled;

    return {
        basePaymentUva,
        monthsToPayoff: withExtra.monthsToPayoff,
        totalPaidUva: withExtra.totalPaidUva,
        totalInterestUva: withExtra.totalInterestUva,
        monthsSaved: Math.max(0, scheduled.monthsToPayoff - withExtra.monthsToPayoff),
        interestSavedUva: Math.max(0, scheduled.totalInterestUva - withExtra.totalInterestUva),
        scheduledMonths: scheduled.monthsToPayoff,
        scheduledTotalPaidUva: scheduled.totalPaidUva,
        scheduledTotalInterestUva: scheduled.totalInterestUva,
    };
}
