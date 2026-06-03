"use client";

import { Banknote, Coins } from "lucide-react";
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

function RateChip({ icon: Icon, label, value, date, loading }) {
    return (
        <div className="flex min-h-[3.25rem] min-w-0 items-center gap-2.5 rounded-lg border border-border/80 bg-muted/40 px-3 py-2">
            <Icon
                className="h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
            />
            <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold tabular-nums">
                    {loading ? (
                        <span className="font-normal text-muted-foreground">
                            Cargando…
                        </span>
                    ) : (
                        <>
                            {value}
                            {date ? (
                                <span className="ml-1 text-xs font-normal text-muted-foreground">
                                    · {date}
                                </span>
                            ) : null}
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

export default function LiveRatesBar({
    dollarPrice,
    uvaPrice,
    ratesMeta,
    loading,
    error,
}) {
    const dollarDate = formatRateDate(ratesMeta?.dollarUpdatedAt);
    const uvaDate = formatRateDate(ratesMeta?.uvaUpdatedAt);

    if (error) {
        return (
            <p
                role="alert"
                className="max-w-md rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive sm:text-sm"
            >
                {error}
            </p>
        );
    }

    return (
        <div
            className="flex flex-wrap justify-end gap-2 sm:gap-3"
            role="status"
            aria-live="polite"
            aria-busy={loading}
            aria-label="Cotizaciones del día"
        >
            <RateChip
                icon={Banknote}
                label="Dólar MEP"
                value={formatRateArs(dollarPrice)}
                date={dollarDate}
                loading={loading}
            />
            <RateChip
                icon={Coins}
                label="Valor UVA"
                value={formatRateArs(uvaPrice)}
                date={uvaDate}
                loading={loading}
            />
        </div>
    );
}
