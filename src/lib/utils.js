import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function formatThousandsDisplay(value) {
    if (value == null || value === "" || Number.isNaN(Number(value))) {
        return "";
    }
    return new Intl.NumberFormat("es-AR", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value));
}

export function parseThousandsInput(raw) {
    const digits = String(raw).replace(/\D/g, "");
    if (digits === "") {
        return "";
    }
    return parseInt(digits, 10);
}

export function formatCurrency(value) {
    if (value == null) return "N/A";
    return formatThousandsDisplay(value);
}

export function formatUva(value) {
    if (value == null || Number.isNaN(Number(value))) return "N/A";
    return new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));
}

export function formatArs(value) {
    if (value == null || Number.isNaN(Number(value))) return "N/A";
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value));
}

export function formatUsd(value) {
    if (value == null || Number.isNaN(Number(value))) return "N/A";
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value));
}

export function formatRateArs(value) {
    if (value == null || Number.isNaN(Number(value))) return "N/A";
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value));
}

export function formatPercent(value, digits = 1) {
    if (value == null || Number.isNaN(Number(value))) return "N/A";
    return `${new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    }).format(Number(value))}%`;
}

export function formatMonthsAsDuration(months) {
    if (months == null || Number.isNaN(Number(months))) return "N/A";

    const total = Math.max(0, Math.round(Number(months)));
    const years = Math.floor(total / 12);
    const remainingMonths = total % 12;

    if (years === 0) {
        return remainingMonths === 1 ? "1 mes" : `${remainingMonths} meses`;
    }

    const yearLabel = years === 1 ? "1 año" : `${years} años`;

    if (remainingMonths === 0) {
        return yearLabel;
    }

    const monthLabel = remainingMonths === 1 ? "1 mes" : `${remainingMonths} meses`;
    return `${yearLabel} y ${monthLabel}`;
}
