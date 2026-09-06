"use client";

import {
    EXTRA_PAYMENT_STEPS,
    EXTRA_STEP_MAX,
    EXTRA_STEP_MIN,
    extraStepLabel,
    getExtraPaymentStep,
} from "@/constants/mortgage-form";

export function extraInstallmentsLabel(stepIndex) {
    return extraStepLabel(stepIndex);
}

export function ExtraInstallmentsSlider({
    id,
    value,
    onChange,
    description = "Cada cuota extra achica el plazo y reduce intereses. La cuota contractual del banco no cambia.",
}) {
    const step = getExtraPaymentStep(value);
    const extraLabel = step.label;

    return (
        <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
                <label htmlFor={id} className="text-sm font-medium text-foreground">
                    Adelanto de cuotas
                </label>
                <span className="text-right text-xs font-medium text-primary">{extraLabel}</span>
            </div>
            <input
                id={id}
                type="range"
                min={EXTRA_STEP_MIN}
                max={EXTRA_STEP_MAX}
                step={1}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
                className="extra-slider"
                aria-valuemin={EXTRA_STEP_MIN}
                aria-valuemax={EXTRA_STEP_MAX}
                aria-valuenow={value}
                aria-valuetext={extraLabel}
                list={`${id}-ticks`}
            />
            <datalist id={`${id}-ticks`}>
                {EXTRA_PAYMENT_STEPS.map((item, index) => (
                    <option key={item.extrasPerYear} value={index} label={item.shortLabel} />
                ))}
            </datalist>
            <div className="flex justify-between gap-2 text-[11px] text-muted-foreground">
                <span>Sin adelantos</span>
                <span>4 extras / mes</span>
            </div>
            {description ? (
                <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            ) : null}
        </div>
    );
}
