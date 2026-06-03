import { cn } from "@/lib/utils";

const CURRENCY_CODES = {
    uva: "UVA",
    usd: "USD",
    ars: "ARS",
};

export function CurrencyLabel({ currency, className }) {
    const code = CURRENCY_CODES[currency] ?? currency.toUpperCase();

    return (
        <span className={cn("currency-label", `currency-label--${currency}`, className)}>
            {code}
        </span>
    );
}
