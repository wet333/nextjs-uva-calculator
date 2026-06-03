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
