"use client";

import { useRef, useState } from "react";
import { Download, ShieldCheck, TriangleAlert, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHouses } from "@/components/providers/HousesProvider";
import { buildBackupFile, downloadTextFile, parseBackupFile } from "@/lib/houses/houses-storage";
import { cn, formatShortDate } from "@/lib/utils";

function plural(count, singular, pluralForm) {
    return `${count} ${count === 1 ? singular : pluralForm}`;
}

function describeImport({ added, updated, unchanged }) {
    if (added === 0 && updated === 0) {
        return "No había nada nuevo: las casas del archivo ya estaban al día.";
    }
    const parts = [];
    if (added > 0) parts.push(plural(added, "nueva", "nuevas"));
    if (updated > 0) parts.push(plural(updated, "actualizada", "actualizadas"));
    if (unchanged > 0) parts.push(`${unchanged} sin cambios`);
    return `Respaldo importado: ${parts.join(", ")}.`;
}

function backupStatus({ houses, updatedAt, lastExportedAt }) {
    if (!lastExportedAt) {
        return houses.length === 0
            ? {
                  tone: "info",
                  text: "Todo se guarda solo en este navegador. Exportá un respaldo de vez en cuando para no perder nada si se borra la caché.",
              }
            : {
                  tone: "warning",
                  text: "Todavía no exportaste un respaldo. Si se borran los datos del navegador, se pierden tus casas.",
              };
    }

    const date = formatShortDate(lastExportedAt);
    if (updatedAt && Date.parse(updatedAt) > Date.parse(lastExportedAt)) {
        return { tone: "warning", text: `Último respaldo: ${date}. Hay cambios sin respaldar.` };
    }
    return { tone: "ok", text: `Último respaldo: ${date}. Todo respaldado.` };
}

const STATUS_ICONS = { ok: ShieldCheck, warning: TriangleAlert, info: ShieldCheck };

export function HousesBackupBar() {
    const { hydrated, houses, updatedAt, lastExportedAt, importHouses, markExported } = useHouses();
    const fileInputRef = useRef(null);
    const [message, setMessage] = useState(null);

    const status = backupStatus({ houses, updatedAt, lastExportedAt });
    const StatusIcon = STATUS_ICONS[status.tone];

    const onExport = () => {
        const { fileName, contents, exportedAt } = buildBackupFile(houses);
        downloadTextFile(fileName, contents);
        markExported(exportedAt);
        setMessage({
            tone: "success",
            text: `Se descargó ${fileName}. Guardalo en un lugar seguro (Drive, mail, etc.).`,
        });
    };

    const onImportFile = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) {
            return;
        }
        try {
            const imported = parseBackupFile(await file.text());
            setMessage({ tone: "success", text: describeImport(importHouses(imported)) });
        } catch (error) {
            setMessage({ tone: "error", text: error.message });
        }
    };

    return (
        <div className="space-y-3 border-t border-white/[0.05] pt-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p
                    className={cn(
                        "flex items-start gap-2 text-xs leading-relaxed",
                        status.tone === "warning" ? "text-amber-300/90" : "text-muted-foreground"
                    )}
                >
                    {hydrated ? (
                        <>
                            <StatusIcon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {status.text}
                        </>
                    ) : (
                        "Cargando casas guardadas…"
                    )}
                </p>
                <div className="flex shrink-0 gap-4">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        className="sr-only"
                        tabIndex={-1}
                        aria-hidden="true"
                        onChange={onImportFile}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        disabled={!hydrated}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload aria-hidden="true" />
                        Importar
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none"
                        disabled={!hydrated || houses.length === 0}
                        onClick={onExport}
                    >
                        <Download aria-hidden="true" />
                        Exportar
                    </Button>
                </div>
            </div>
            <div aria-live="polite">
                {message ? (
                    <p
                        role={message.tone === "error" ? "alert" : "status"}
                        className={cn(
                            "rounded-lg px-3 py-2 text-xs leading-relaxed ring-1",
                            message.tone === "error"
                                ? "bg-destructive/10 text-destructive ring-destructive/20"
                                : "bg-emerald-500/[0.07] text-emerald-300 ring-emerald-400/20"
                        )}
                    >
                        {message.text}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
