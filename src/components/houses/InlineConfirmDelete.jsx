"use client";

import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Botón de borrar en dos pasos: el primer clic pide confirmación en el lugar. */
export function InlineConfirmDelete({ label, confirmLabel = "Borrar", onConfirm }) {
    const [confirming, setConfirming] = useState(false);
    const triggerRef = useRef(null);
    const confirmRef = useRef(null);
    const wasConfirming = useRef(false);

    useEffect(() => {
        if (confirming) {
            confirmRef.current?.focus();
        } else if (wasConfirming.current) {
            triggerRef.current?.focus();
        }
        wasConfirming.current = confirming;
    }, [confirming]);

    if (confirming) {
        return (
            <span
                className="inline-flex items-center gap-1"
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        setConfirming(false);
                    }
                }}
            >
                <Button
                    ref={confirmRef}
                    variant="destructive"
                    className="h-7 px-2.5 text-xs"
                    onClick={onConfirm}
                >
                    {confirmLabel}
                </Button>
                <Button
                    variant="ghost"
                    className="h-7 px-2.5 text-xs"
                    onClick={() => setConfirming(false)}
                >
                    Cancelar
                </Button>
            </span>
        );
    }

    return (
        <Button
            ref={triggerRef}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            aria-label={label}
            title={label}
            onClick={() => setConfirming(true)}
        >
            <Trash2 aria-hidden="true" />
        </Button>
    );
}
