"use client";

import { TriangleAlert } from "lucide-react";
import { useHouses } from "@/components/providers/HousesProvider";

export function HousesStorageAlert() {
    const { storageError } = useHouses();

    if (!storageError) {
        return null;
    }

    return (
        <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm leading-relaxed text-destructive ring-1 ring-destructive/20"
        >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {storageError}
        </p>
    );
}
