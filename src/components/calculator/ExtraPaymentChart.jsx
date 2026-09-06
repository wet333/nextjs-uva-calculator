"use client";

import {
    extraPaymentFromInstallments,
    frenchMonthlyPayment,
    simulateAmortization,
} from "@/lib/mortgage/amortization";
import { EXTRA_PAYMENT_STEPS } from "@/constants/mortgage-form";
import { formatMonthsAsDuration, formatThousandsDisplay, formatUva } from "@/lib/utils";

const X_TICK_INDICES = [0, 1, 6, 9];

function buildPoints(principalUva, annualRatePct, termMonths) {
    const basePayment = frenchMonthlyPayment(principalUva, annualRatePct, termMonths);

    return EXTRA_PAYMENT_STEPS.map((step, stepIndex) => {
        const extraPayment = extraPaymentFromInstallments(basePayment, step.extrasPerYear);
        const simulation = simulateAmortization({
            principalUva,
            annualRatePct,
            termMonths,
            extraPaymentUva: extraPayment,
        });

        return {
            stepIndex,
            extrasPerYear: step.extrasPerYear,
            label: step.label,
            shortLabel: step.shortLabel,
            total: simulation.totalPaidUva,
            interest: simulation.totalInterestUva,
            monthsToPayoff: simulation.monthsToPayoff,
            monthsSaved: simulation.monthsSaved,
            interestSaved: simulation.interestSavedUva,
            scheduledTotal: simulation.scheduledTotalPaidUva,
        };
    });
}

function buildYTicks(minY, maxY, count = 4) {
    if (maxY <= minY) {
        return [minY];
    }

    const ticks = [];
    for (let index = 0; index < count; index += 1) {
        ticks.push(minY + ((maxY - minY) * index) / (count - 1));
    }
    return ticks;
}

export function ExtraPaymentChart({
    principalUva,
    annualRatePct,
    termMonths,
    activeStepIndex = 0,
    onSelectStep,
}) {
    if (!principalUva || principalUva <= 0) {
        return null;
    }

    const points = buildPoints(principalUva, annualRatePct, termMonths);
    const minY = Math.min(...points.map((point) => point.total));
    const maxY = Math.max(...points.map((point) => point.total));
    const padding = { top: 16, right: 18, bottom: 36, left: 58 };
    const width = 640;
    const height = 228;
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const range = Math.max(maxY - minY, 1);
    const lastIndex = points.length - 1;
    const yTicks = buildYTicks(minY, maxY);

    const coords = points.map((point) => ({
        ...point,
        x: padding.left + (point.stepIndex / lastIndex) * innerWidth,
        y: padding.top + (1 - (point.total - minY) / range) * innerHeight,
    }));

    const polyline = coords.map((point) => `${point.x},${point.y}`).join(" ");
    const area = `${padding.left},${padding.top + innerHeight} ${polyline} ${
        padding.left + innerWidth
    },${padding.top + innerHeight}`;
    const active = coords.find((point) => point.stepIndex === activeStepIndex) ?? coords[0];
    const baseline = coords[0];

    return (
        <figure className="space-y-3 rounded-xl bg-white/[0.02] px-3 py-3 ring-1 ring-white/[0.05] sm:px-4">
            <figcaption className="text-xs leading-relaxed text-muted-foreground">
                Total a devolver en UVA según la escala de adelantos. La línea punteada es el costo
                sin adelantar.
            </figcaption>
            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/[0.05]">
                    <dt className="text-[11px] text-muted-foreground">Adelanto</dt>
                    <dd className="mt-0.5 text-xs font-semibold leading-snug text-foreground">
                        {active.label}
                    </dd>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/[0.05]">
                    <dt className="text-[11px] text-muted-foreground">Total a devolver</dt>
                    <dd className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">
                        {formatUva(active.total)} UVA
                    </dd>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/[0.05]">
                    <dt className="text-[11px] text-muted-foreground">Plazo resultante</dt>
                    <dd className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">
                        {formatMonthsAsDuration(active.monthsToPayoff)}
                    </dd>
                </div>
                <div className="rounded-lg bg-white/[0.03] px-2.5 py-2 ring-1 ring-white/[0.05]">
                    <dt className="text-[11px] text-muted-foreground">Ahorro vs sin adelantar</dt>
                    <dd className="mt-0.5 text-xs font-semibold tabular-nums text-foreground">
                        {formatUva(active.interestSaved)} UVA
                    </dd>
                    <dd className="text-[11px] text-muted-foreground">
                        {active.monthsSaved} meses menos
                    </dd>
                </div>
            </dl>
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-auto w-full"
                role="img"
                aria-label={`${active.label}: devolvés ${formatUva(active.total)} UVA en ${formatMonthsAsDuration(active.monthsToPayoff)}`}
            >
                {yTicks.map((tick) => {
                    const y = padding.top + (1 - (tick - minY) / range) * innerHeight;
                    return (
                        <g key={tick}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={padding.left + innerWidth}
                                y2={y}
                                className="stroke-white/10"
                                strokeWidth="1"
                            />
                            <text
                                x={padding.left - 8}
                                y={y + 3}
                                textAnchor="end"
                                className="fill-muted-foreground text-[10px]"
                            >
                                {formatThousandsDisplay(tick)}
                            </text>
                        </g>
                    );
                })}
                <line
                    x1={padding.left}
                    y1={padding.top + innerHeight}
                    x2={padding.left + innerWidth}
                    y2={padding.top + innerHeight}
                    className="stroke-white/20"
                    strokeWidth="1"
                />
                <line
                    x1={padding.left}
                    y1={baseline.y}
                    x2={padding.left + innerWidth}
                    y2={baseline.y}
                    className="stroke-white/35"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                />
                <text
                    x={padding.left + innerWidth}
                    y={Math.max(padding.top + 10, baseline.y - 6)}
                    textAnchor="end"
                    className="fill-muted-foreground text-[10px]"
                >
                    Sin adelantar
                </text>
                <polygon points={area} className="fill-primary/12" />
                <polyline
                    points={polyline}
                    fill="none"
                    className="stroke-primary"
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
                <line
                    x1={active.x}
                    y1={padding.top}
                    x2={active.x}
                    y2={padding.top + innerHeight}
                    className="stroke-primary/35"
                    strokeWidth="1"
                />
                {coords.map((point) => {
                    const selected = point.stepIndex === activeStepIndex;
                    return (
                        <circle
                            key={point.stepIndex}
                            cx={point.x}
                            cy={point.y}
                            r={selected ? 5.5 : 3.5}
                            className={
                                selected
                                    ? "fill-primary stroke-primary-foreground"
                                    : "fill-card stroke-primary"
                            }
                            strokeWidth="1.5"
                            role={onSelectStep ? "button" : undefined}
                            tabIndex={onSelectStep ? 0 : undefined}
                            style={{ cursor: onSelectStep ? "pointer" : "default" }}
                            onClick={() => onSelectStep?.(point.stepIndex)}
                            onKeyDown={(event) => {
                                if (!onSelectStep) {
                                    return;
                                }
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    onSelectStep(point.stepIndex);
                                }
                            }}
                        >
                            <title>{`${point.label}: ${formatUva(point.total)} UVA`}</title>
                        </circle>
                    );
                })}
                {X_TICK_INDICES.map((index) => {
                    const point = coords[index];
                    if (!point) {
                        return null;
                    }
                    return (
                        <text
                            key={point.shortLabel}
                            x={point.x}
                            y={height - 10}
                            textAnchor="middle"
                            className="fill-muted-foreground text-[10px]"
                        >
                            {point.shortLabel}
                        </text>
                    );
                })}
            </svg>
        </figure>
    );
}
