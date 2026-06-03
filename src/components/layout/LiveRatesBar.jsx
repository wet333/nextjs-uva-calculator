"use client";

import { formatRateArs } from "@/lib/utils";

function formatRateDate(isoDate) {
    if (!isoDate) return null;
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) {
        const [y, m, d] = String(isoDate).split("-");
        if (y && m && d) {
            return new Intl.DateTimeFormat("es-AR", {
                day: "numeric",
                month: "short",
                year: "numeric",
            }).format(new Date(Number(y), Number(m) - 1, Number(d)));
        }
        return null;
    }
    return new Intl.DateTimeFormat("es-AR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(parsed);
}

function RateStat({ label, value, date, loading }) {
    return (
        <div className="min-w-0 text-right lg:text-left">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">
                {loading ? (
                    <span className="font-normal text-muted-foreground">Cargando…</span>
                ) : (
                    value
                )}
            </p>
            {!loading && date ? (
                <p className="mt-0.5 text-[11px] text-muted-foreground">{date}</p>
            ) : null}
        </div>
    );
}

export function LiveRatesBar({ dollarPrice, uvaPrice, ratesMeta, loading, error }) {
    const dollarDate = formatRateDate(ratesMeta?.dollarUpdatedAt);
    const uvaDate = formatRateDate(ratesMeta?.uvaUpdatedAt);

    if (error) {
        return (
            <p
                role="alert"
                className="w-full rounded-lg bg-destructive/10 px-3 py-2.5 text-xs text-destructive ring-1 ring-destructive/20 sm:text-sm lg:w-auto"
            >
                {error}
            </p>
        );
    }

    return (
        <div
            className="flex w-full items-start justify-between gap-6 sm:justify-end sm:gap-8 lg:w-auto lg:justify-start"
            role="status"
            aria-live="polite"
            aria-busy={loading}
            aria-label="Cotizaciones de referencia del día"
        >
            <RateStat
                label="Dólar MEP"
                value={formatRateArs(dollarPrice)}
                date={dollarDate}
                loading={loading}
            />
            <div
                className="hidden h-10 w-px shrink-0 bg-white/[0.08] sm:block"
                aria-hidden="true"
            />
            <RateStat
                label="Valor UVA"
                value={formatRateArs(uvaPrice)}
                date={uvaDate}
                loading={loading}
            />
        </div>
    );
}
