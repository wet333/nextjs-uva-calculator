"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { SAVINGS_MODE_REDUCE } from "@/constants/mortgage-form";
import { uvaToArs, uvaToUsd } from "@/lib/currency-conversions";
import { cn, formatArs, formatPercent, formatUsd } from "@/lib/utils";

const STOPWORDS = new Set(["banco", "de", "del", "la", "el"]);

/** "Banco Nacion" → "Na", "ICBC" → "IC": ancla visual para escanear la lista sin logos. */
function monogram(name) {
    const word =
        name.split(/[\s-]+/).find((part) => part && !STOPWORDS.has(part.toLowerCase())) ?? name;
    const isAcronym = word === word.toUpperCase();
    return isAcronym
        ? word.slice(0, 2)
        : word.charAt(0).toUpperCase() + word.charAt(1).toLowerCase();
}

/** Nombre para buscar tipeando: sin "Banco", así "Gal" encuentra "Banco Galicia". */
function searchName(name) {
    return name.replace(/^banco\s+(de\s+la\s+|del\s+|de\s+)?/i, "");
}

/**
 * Qué mostrar de cada banco. La cifra principal responde la pregunta del escenario
 * ("casa hasta" o "cuota") y la diferencia se mide contra la mejor opción.
 */
function describeBank(row, best, isReduce) {
    const paymentArs = row.paymentUva > 0 ? uvaToArs(row.paymentUva) : null;
    const details = [
        row.rate != null ? `TNA ${formatPercent(row.rate)}` : null,
        `${row.termYears} años${row.termCapped ? " (máx.)" : ""}`,
        !isReduce && paymentArs ? `cuota ${formatArs(paymentArs)}` : null,
    ]
        .filter(Boolean)
        .join(" · ");

    if (!row.eligible) {
        return {
            details: row.ineligibleReasons[0] ?? details,
            label: null,
            value: isReduce ? "No te alcanza" : "No calificás",
            delta: null,
            isBest: false,
        };
    }

    const isBest = row === best;
    if (isReduce) {
        const diff = paymentArs - uvaToArs(best.paymentUva);
        return {
            details,
            label: "Cuota mensual",
            value: formatArs(paymentArs),
            delta: isBest ? null : diff < 1 ? "Igual a la mejor" : `+ ${formatArs(diff)} por mes`,
            isBest,
        };
    }

    const propertyUsd = uvaToUsd(row.propertyUva);
    const diff = uvaToUsd(best.propertyUva) - propertyUsd;
    return {
        details,
        label: "Casa hasta",
        value: formatUsd(propertyUsd),
        delta: isBest ? null : diff < 1 ? "Igual a la mejor" : `${formatUsd(diff)} menos`,
        isBest,
    };
}

function Monogram({ name, muted }) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ring-1",
                muted
                    ? "bg-white/[0.04] text-muted-foreground ring-white/[0.08]"
                    : "bg-primary/10 text-primary ring-primary/20"
            )}
        >
            {monogram(name)}
        </span>
    );
}

function bestLabel(isReduce) {
    return isReduce ? "Menor cuota" : "Mayor alcance";
}

/**
 * Fila de banco compartida por el disparador y las opciones de la lista. En la lista, la
 * columna derecha muestra "Mayor alcance" / "Menor cuota" o la diferencia con la mejor.
 */
function BankSummary({ row, info, isReduce, nameSlot, variant }) {
    const isTrigger = variant === "trigger";
    const note = info.isBest ? bestLabel(isReduce) : info.delta;

    return (
        <span className="grid min-w-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
            <Monogram name={row.bankName} muted={!row.eligible} />
            <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-2">
                    <span
                        className={cn(
                            "truncate text-sm font-medium",
                            row.eligible ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {nameSlot ?? row.bankName}
                    </span>
                    {isTrigger && info.isBest ? (
                        <span className="hidden shrink-0 rounded-full bg-primary/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-primary sm:inline">
                            {bestLabel(isReduce)}
                        </span>
                    ) : null}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                    {info.details}
                </span>
            </span>
            <span className="justify-self-end text-right">
                {isTrigger && info.label ? (
                    <span className="block text-[11px] text-muted-foreground">{info.label}</span>
                ) : null}
                <span
                    className={cn(
                        "block tabular-nums",
                        row.eligible
                            ? cn(
                                  "font-semibold text-foreground",
                                  isTrigger ? "text-base" : "text-sm"
                              )
                            : "text-xs font-medium text-muted-foreground"
                    )}
                >
                    {info.value}
                </span>
                {!isTrigger && note ? (
                    <span
                        className={cn(
                            "block text-[11px] tabular-nums",
                            info.isBest ? "font-medium text-primary" : "text-muted-foreground"
                        )}
                    >
                        {note}
                    </span>
                ) : null}
            </span>
        </span>
    );
}

function BankOption({ row, info, isReduce }) {
    return (
        <SelectPrimitive.Item
            value={row.bankName}
            textValue={searchName(row.bankName)}
            className={cn(
                "relative flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 outline-none transition-colors",
                "data-[highlighted]:bg-white/[0.05] data-[state=checked]:bg-primary/10"
            )}
        >
            <BankSummary
                row={row}
                info={info}
                isReduce={isReduce}
                nameSlot={<SelectPrimitive.ItemText>{row.bankName}</SelectPrimitive.ItemText>}
            />
            <span className="flex w-4 shrink-0 justify-center">
                <SelectPrimitive.ItemIndicator>
                    <Check className="h-4 w-4 text-primary" aria-hidden="true" />
                </SelectPrimitive.ItemIndicator>
            </span>
        </SelectPrimitive.Item>
    );
}

function GroupLabel({ children }) {
    return (
        <SelectPrimitive.Label className="px-2.5 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {children}
        </SelectPrimitive.Label>
    );
}

/**
 * Selector de banco (patrón "select-only combobox" de WAI-ARIA vía Radix): teclado completo,
 * búsqueda al tipear y lista agrupada en bancos que califican y que no.
 */
export function BankPicker({ id, rows, selectedBankName, onSelectBank }) {
    const isReduce = rows[0]?.savingsMode === SAVINGS_MODE_REDUCE;
    const eligible = rows.filter((row) => row.eligible);
    const ineligible = rows.filter((row) => !row.eligible);
    const best = eligible[0] ?? null;
    const selected = rows.find((row) => row.bankName === selectedBankName) ?? null;
    const labelId = `${id}-label`;
    const describe = (row) => describeBank(row, best, isReduce);

    return (
        <div className="space-y-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span id={labelId} className="text-sm font-medium text-foreground">
                    Banco
                </span>
                <span className="text-xs text-muted-foreground">
                    {eligible.length} de {rows.length}{" "}
                    {isReduce ? "te alcanzan · por menor cuota" : "califican · por mayor alcance"}
                </span>
            </div>
            <SelectPrimitive.Root
                value={selectedBankName ?? undefined}
                onValueChange={onSelectBank}
            >
                <SelectPrimitive.Trigger
                    id={id}
                    aria-labelledby={labelId}
                    className={cn(
                        "group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl bg-input/60 px-3 py-2.5 text-left ring-1 ring-white/[0.08] transition-[background-color,box-shadow]",
                        "hover:bg-input hover:ring-white/[0.14]",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                        "data-[state=open]:ring-primary/40"
                    )}
                >
                    {/* Select.Value de Radix ignora className, así que el contenido va en un span propio.
                        El grid del disparador fija el monto y la flecha contra el borde derecho. */}
                    <span className="flex min-w-0">
                        {selected ? (
                            <BankSummary
                                row={selected}
                                info={describe(selected)}
                                isReduce={isReduce}
                                variant="trigger"
                            />
                        ) : (
                            <span className="text-sm text-muted-foreground">Elegí un banco</span>
                        )}
                    </span>
                    <SelectPrimitive.Icon asChild>
                        <ChevronDown
                            className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                        />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        position="popper"
                        sideOffset={6}
                        collisionPadding={12}
                        className={cn(
                            "z-[60] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-panel ring-1 ring-white/[0.08]",
                            "max-h-[min(30rem,var(--radix-select-content-available-height))]",
                            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
                            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
                        )}
                    >
                        <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-muted-foreground">
                            <ChevronUp className="h-4 w-4" aria-hidden="true" />
                        </SelectPrimitive.ScrollUpButton>
                        <SelectPrimitive.Viewport className="p-1">
                            {eligible.length > 0 ? (
                                <SelectPrimitive.Group>
                                    <GroupLabel>
                                        {isReduce
                                            ? "Te alcanza · de menor a mayor cuota"
                                            : "Calificás · de mayor a menor alcance"}
                                    </GroupLabel>
                                    {eligible.map((row) => (
                                        <BankOption
                                            key={row.bankName}
                                            row={row}
                                            info={describe(row)}
                                            isReduce={isReduce}
                                        />
                                    ))}
                                </SelectPrimitive.Group>
                            ) : null}
                            {eligible.length > 0 && ineligible.length > 0 ? (
                                <SelectPrimitive.Separator className="mx-2 my-1 h-px bg-white/[0.06]" />
                            ) : null}
                            {ineligible.length > 0 ? (
                                <SelectPrimitive.Group>
                                    <GroupLabel>
                                        {isReduce ? "No te alcanza" : "No calificás"}
                                    </GroupLabel>
                                    {ineligible.map((row) => (
                                        <BankOption
                                            key={row.bankName}
                                            row={row}
                                            info={describe(row)}
                                            isReduce={isReduce}
                                        />
                                    ))}
                                </SelectPrimitive.Group>
                            ) : null}
                        </SelectPrimitive.Viewport>
                        <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-muted-foreground">
                            <ChevronDown className="h-4 w-4" aria-hidden="true" />
                        </SelectPrimitive.ScrollDownButton>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
        </div>
    );
}
