"use client";

import { HandCoins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CurrencyLabel } from "@/components/calculator/CurrencyLabel";
import { CurrencyToggle } from "@/components/forms/CurrencyAmountInput";
import { FormattedNumberInput } from "@/components/forms/FormattedNumberInput";
import { useRates } from "@/components/providers/RatesProvider";
import { PURCHASE_FEES_RATE } from "@/constants/houses";
import { compareOffer, pricePerSquareMeter, purchaseCost } from "@/lib/houses/purchase-cost";
import { formatArs, formatPercent, formatUsd } from "@/lib/utils";

const FEES_PERCENT_LABEL = `${Math.round(PURCHASE_FEES_RATE * 100)}%`;

/** Una fila por precio: input a la izquierda, total con honorarios a la derecha, detalle abajo. */
function PriceRow({ id, label, value, onValueChange, currency, format, convert }) {
    const cost = purchaseCost(value);

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-1 py-3 first:pt-0 last:pb-0">
            <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
                {label}
            </label>
            <span className="text-right text-[11px] text-muted-foreground">
                Total c/ honorarios
            </span>
            <div className="relative">
                <span
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[11px]"
                    aria-hidden="true"
                >
                    <CurrencyLabel currency={currency.toLowerCase()} />
                </span>
                <FormattedNumberInput
                    id={id}
                    name={id}
                    value={value}
                    onChange={onValueChange}
                    placeholder={currency === "USD" ? "Ej. 120.000" : "Ej. 150.000.000"}
                    className="pl-12"
                />
            </div>
            <p className="flex h-10 items-center justify-end text-base font-semibold tabular-nums text-foreground">
                {cost ? format(cost.total) : "—"}
            </p>
            {cost ? (
                <p className="col-span-2 text-[11px] leading-relaxed tabular-nums text-muted-foreground/80">
                    + {format(cost.fees)} honorarios ({FEES_PERCENT_LABEL})
                    {convert ? ` · ≈ ${convert(cost.total)} MEP` : ""}
                </p>
            ) : null}
        </div>
    );
}

function OfferComparison({ comparison, format }) {
    const { diffPercent, totalDifference } = comparison;
    const rounded = Math.round(diffPercent * 10) / 10;

    const headline =
        rounded === 0
            ? "Tu oferta coincide con el publicado."
            : `Tu oferta está ${formatPercent(Math.abs(rounded))} ${
                  rounded < 0 ? "por debajo" : "por encima"
              } del publicado.`;

    return (
        <p className="flex items-start gap-2 rounded-md bg-white/[0.02] px-3 py-2 text-xs leading-relaxed text-muted-foreground ring-1 ring-white/[0.05]">
            <HandCoins className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span>
                <span className="text-foreground">{headline}</span>
                {totalDifference !== 0
                    ? ` Con honorarios, pagarías ${format(Math.abs(totalDifference))} ${
                          totalDifference > 0 ? "menos" : "más"
                      }.`
                    : null}
            </span>
        </p>
    );
}

/** Campo de m² con el valor por m² (publicado y con la oferta) debajo, en letra sutil. */
function AreaField({ id, label, unitLabel, value, onValueChange, house, format }) {
    const perAsking = pricePerSquareMeter(house.askingPrice, value);
    const perOffer = pricePerSquareMeter(house.offerPrice, value);

    return (
        <div className="min-w-0">
            <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
                {label}
                <span className="sr-only"> en metros cuadrados</span>
            </label>
            <div className="relative mt-1">
                <FormattedNumberInput
                    id={id}
                    name={id}
                    value={value}
                    onChange={onValueChange}
                    placeholder="Ej. 120"
                    className="pr-10"
                />
                <span
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                    aria-hidden="true"
                >
                    m²
                </span>
            </div>
            {perAsking || perOffer ? (
                <div className="mt-1.5 space-y-0.5 text-[11px] leading-snug tabular-nums text-muted-foreground/80">
                    {perAsking ? (
                        <p>
                            {format(perAsking)}/m² {unitLabel}
                        </p>
                    ) : null}
                    {perOffer ? <p>{format(perOffer)}/m² con tu oferta</p> : null}
                </div>
            ) : null}
        </div>
    );
}

export function PriceSection({ house, onChange, className }) {
    const { ready: ratesReady, dollarPrice } = useRates();
    const isUsd = house.currency === "USD";
    const format = isUsd ? formatUsd : formatArs;
    const comparison = compareOffer(house.askingPrice, house.offerPrice);

    let convert = null;
    if (ratesReady && dollarPrice) {
        convert = isUsd
            ? (amount) => formatArs(amount * dollarPrice)
            : (amount) => formatUsd(amount / dollarPrice);
    }

    const setField = (field) => (nextValue) =>
        onChange((current) => ({ ...current, [field]: nextValue }));

    return (
        <Card className={className}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <CardTitle tag="h2">Precio y superficie</CardTitle>
                <CurrencyToggle
                    value={house.currency}
                    onChange={(currency) => onChange((current) => ({ ...current, currency }))}
                    groupLabel="Moneda de los precios"
                />
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                <div className="divide-y divide-white/[0.05]">
                    <PriceRow
                        id={`askingPrice-${house.id}`}
                        label="Publicado"
                        value={house.askingPrice}
                        onValueChange={setField("askingPrice")}
                        currency={house.currency}
                        format={format}
                        convert={convert}
                    />
                    <PriceRow
                        id={`offerPrice-${house.id}`}
                        label="Mi oferta"
                        value={house.offerPrice}
                        onValueChange={setField("offerPrice")}
                        currency={house.currency}
                        format={format}
                        convert={convert}
                    />
                </div>
                {comparison ? <OfferComparison comparison={comparison} format={format} /> : null}
                <div className="grid grid-cols-2 gap-3 border-t border-white/[0.05] pt-4">
                    <AreaField
                        id={`landArea-${house.id}`}
                        label="Terreno"
                        unitLabel="de terreno"
                        value={house.landArea}
                        onValueChange={setField("landArea")}
                        house={house}
                        format={format}
                    />
                    <AreaField
                        id={`coveredArea-${house.id}`}
                        label="Cubiertos"
                        unitLabel="construido"
                        value={house.coveredArea}
                        onValueChange={setField("coveredArea")}
                        house={house}
                        format={format}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
