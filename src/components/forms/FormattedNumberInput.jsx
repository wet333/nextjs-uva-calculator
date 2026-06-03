"use client";

import { forwardRef, useLayoutEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn, formatThousandsDisplay, parseThousandsInput } from "@/lib/utils";

function getCursorAfterFormat(formatted, digitsBeforeCursor) {
    if (digitsBeforeCursor === 0) {
        return 0;
    }

    let digitCount = 0;
    for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
            digitCount++;
            if (digitCount === digitsBeforeCursor) {
                return i + 1;
            }
        }
    }

    return formatted.length;
}

export const FormattedNumberInput = forwardRef(function FormattedNumberInput(
    { value, onChange, onBlur, className, id, name, placeholder, disabled, max, ...props },
    ref
) {
    const [displayValue, setDisplayValue] = useState(() => formatThousandsDisplay(value));
    const inputRef = useRef(null);
    const cursorRef = useRef(null);

    useLayoutEffect(() => {
        setDisplayValue(formatThousandsDisplay(value));
    }, [value]);

    useLayoutEffect(() => {
        if (cursorRef.current == null || !inputRef.current) {
            return;
        }
        inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current);
        cursorRef.current = null;
    });

    const setRefs = (node) => {
        inputRef.current = node;
        if (typeof ref === "function") {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    };

    const handleChange = (event) => {
        const input = event.target;
        const selectionStart = input.selectionStart ?? 0;
        const digitsBeforeCursor = input.value.slice(0, selectionStart).replace(/\D/g, "").length;

        let numeric = parseThousandsInput(input.value);

        if (numeric !== "" && max != null && numeric > max) {
            numeric = max;
        }

        const formatted = numeric === "" ? "" : formatThousandsDisplay(numeric);

        cursorRef.current = getCursorAfterFormat(formatted, digitsBeforeCursor);
        setDisplayValue(formatted);
        onChange(numeric === "" ? "" : numeric);
    };

    return (
        <Input
            ref={setRefs}
            type="text"
            inputMode="numeric"
            id={id}
            name={name}
            value={displayValue}
            onChange={handleChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            className={cn("tabular-nums", className)}
            {...props}
        />
    );
});
