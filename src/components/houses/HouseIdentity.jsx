"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Loader2, MapPin, Pencil, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InlineConfirmDelete } from "@/components/houses/InlineConfirmDelete";
import { LocationMap } from "@/components/houses/LocationMap";
import { resolveLocation } from "@/lib/houses/geocoding";
import {
    applyLocationResult,
    clearLocation,
    getHouseDisplayName,
    getHouseMapsUrl,
    retryLocation,
    setLocation,
} from "@/lib/houses/house-model";
import { isGoogleMapsUrl, parseLocationInput } from "@/lib/houses/maps-location";
import { cn, formatDateTime, formatShortDate } from "@/lib/utils";

const inlineFieldClass =
    "w-full rounded-lg bg-transparent px-2 -mx-2 text-foreground placeholder:text-muted-foreground/60 transition-colors hover:bg-white/[0.03] focus-visible:bg-input focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

const INVALID_LINK_ERROR =
    "Ese link no es válido. Pegá el link de Google Maps o escribí la dirección.";

function LocationStatus({ house, onRetry }) {
    if (house.locationStatus === "pending") {
        return (
            <p role="status" className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                {house.address ? "Ubicándola en el mapa…" : "Leyendo la dirección del link…"}
            </p>
        );
    }
    if (house.locationStatus === "not_found") {
        return (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {house.address
                    ? "No la encontramos en el mapa; el ícono de al lado la busca en Google Maps."
                    : "No pudimos leer la dirección de este link. Tocá el lápiz para escribirla."}
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    Reintentar
                </button>
            </p>
        );
    }
    return null;
}

/**
 * Campo único de ubicación: se escribe la dirección o se pega un link / coordenadas de
 * Google Maps, y lo que falte (dirección o punto en el mapa) se completa solo.
 */
function HouseLocation({ house, onChange }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [error, setError] = useState(null);
    const onChangeRef = useRef(onChange);
    const addressButtonRef = useRef(null);
    const focusAddressButton = useRef(false);

    const inputId = `house-location-${house.id}`;
    const hasLocation = Boolean(house.address || house.mapsUrl);
    const showInput = !hasLocation || editing;
    const pending = house.locationStatus === "pending";
    const mapsUrl = getHouseMapsUrl(house);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    useEffect(() => {
        if (!pending) {
            return;
        }
        const target = { mapsUrl: house.mapsUrl, address: house.address };
        resolveLocation(target).then((result) => {
            onChangeRef.current((current) => applyLocationResult(current, target, result));
        });
    }, [pending, house.mapsUrl, house.address]);

    useEffect(() => {
        if (!showInput && focusAddressButton.current) {
            focusAddressButton.current = false;
            addressButtonRef.current?.focus();
        }
    }, [showInput]);

    const initialDraft = house.address || house.mapsUrl || "";

    const startEditing = () => {
        setDraft(initialDraft);
        setEditing(true);
    };

    const stopEditing = () => {
        setDraft("");
        setEditing(false);
        setError(null);
    };

    const save = (raw) => {
        if (editing && raw.trim() === initialDraft) {
            stopEditing();
            return;
        }
        const parsed = parseLocationInput(raw);
        if (!parsed) {
            setError(INVALID_LINK_ERROR);
            return;
        }
        onChange((current) => setLocation(current, parsed));
        focusAddressButton.current = true;
        stopEditing();
    };

    // Vista y edición comparten geometría: el ícono queda en el borde izquierdo del título
    // (el -ml-2 / px-2 deja el fondo de hover por fuera) y el texto siempre 22px después.
    if (!showInput) {
        // Con mapa, el propio mapa abre Google Maps; sin mapa hace falta un acceso aparte.
        const openLabel =
            house.mapsUrl && !isGoogleMapsUrl(house.mapsUrl)
                ? "Abrir ubicación"
                : "Abrir en Google Maps";

        return (
            <div className="space-y-1.5">
                <div className="flex items-start gap-1">
                    <button
                        ref={addressButtonRef}
                        type="button"
                        title="Cambiar ubicación"
                        onClick={startEditing}
                        className="-ml-2 flex min-w-0 items-start gap-1.5 rounded-md px-2 py-1.5 text-left text-sm text-foreground/90 transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    >
                        <MapPin
                            className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"
                            aria-hidden="true"
                        />
                        <span className="min-w-0 break-words">
                            {house.address || (
                                <span className="text-muted-foreground">
                                    {pending ? "Buscando la dirección…" : "Ubicación sin dirección"}
                                </span>
                            )}
                        </span>
                    </button>
                    <div className="flex shrink-0 items-center">
                        {!house.coordinates && mapsUrl ? (
                            <Button
                                asChild
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                                <a
                                    href={mapsUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={openLabel}
                                    title={openLabel}
                                >
                                    <ExternalLink aria-hidden="true" />
                                </a>
                            </Button>
                        ) : null}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            aria-label="Cambiar ubicación"
                            title="Cambiar ubicación"
                            onClick={startEditing}
                        >
                            <Pencil aria-hidden="true" />
                        </Button>
                        <InlineConfirmDelete
                            label="Quitar ubicación"
                            confirmLabel="Quitar"
                            onConfirm={() => onChange(clearLocation)}
                        />
                    </div>
                </div>
                <LocationStatus house={house} onRetry={() => onChange(retryLocation)} />
            </div>
        );
    }

    return (
        <div className="max-w-xl space-y-1.5">
            <form
                noValidate
                className="flex items-center gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    save(draft);
                }}
            >
                <div className="group relative -ml-2 min-w-0 flex-1">
                    <MapPin
                        className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
                        aria-hidden="true"
                    />
                    <label htmlFor={inputId} className="sr-only">
                        Ubicación: dirección o link de Google Maps
                    </label>
                    <input
                        id={inputId}
                        value={draft}
                        maxLength={2000}
                        autoComplete="off"
                        autoFocus={editing}
                        placeholder="Dirección o link de Google Maps"
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? `${inputId}-error` : `${inputId}-hint`}
                        className="field-control h-9 pl-[1.875rem] pr-3 placeholder:text-muted-foreground/70"
                        onChange={(event) => {
                            setDraft(event.target.value);
                            setError(null);
                        }}
                        onPaste={(event) => {
                            // Pegar un link (o coordenadas) reemplazando todo el campo lo guarda directo.
                            const { selectionStart, selectionEnd, value } = event.currentTarget;
                            const replacesAll =
                                !value.trim() ||
                                (selectionStart === 0 && selectionEnd === value.length);
                            const pasted = event.clipboardData.getData("text");
                            if (replacesAll && parseLocationInput(pasted)?.kind === "link") {
                                event.preventDefault();
                                save(pasted);
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Escape" && editing) {
                                stopEditing();
                            }
                        }}
                    />
                </div>
                {draft.trim() ? (
                    <Button type="submit" variant="secondary" className="h-9 shrink-0 px-3 text-xs">
                        Guardar
                    </Button>
                ) : null}
                {editing ? (
                    <Button
                        variant="ghost"
                        className="h-9 shrink-0 px-3 text-xs"
                        onClick={stopEditing}
                    >
                        Cancelar
                    </Button>
                ) : null}
            </form>
            {error ? (
                <p
                    id={`${inputId}-error`}
                    role="alert"
                    className="text-xs leading-relaxed text-destructive"
                >
                    {error}
                </p>
            ) : (
                <p
                    id={`${inputId}-hint`}
                    className="text-[11px] leading-relaxed text-muted-foreground"
                >
                    Escribí la dirección (ej. Payró 1349, Tandil) o pegá el link de Compartir de
                    Google Maps. Lo que falte se completa solo.
                </p>
            )}
        </div>
    );
}

/**
 * Cabecera de la ficha: datos a la izquierda con una sola línea de alineación y la fecha al
 * pie; si la casa está ubicada, el mapa a la derecha (abajo en mobile) con la misma altura.
 */
export function HouseIdentity({ house, onChange }) {
    const mapsUrl = getHouseMapsUrl(house);

    return (
        <Card>
            <div className="flex flex-col gap-5 p-5 sm:p-6 md:flex-row">
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                    <div className="space-y-1.5">
                        <label htmlFor={`house-name-${house.id}`} className="sr-only">
                            Nombre de la casa
                        </label>
                        <input
                            id={`house-name-${house.id}`}
                            value={house.name}
                            maxLength={200}
                            autoComplete="off"
                            placeholder={getHouseDisplayName(house)}
                            onChange={(event) =>
                                onChange((current) => ({ ...current, name: event.target.value }))
                            }
                            className={cn(
                                inlineFieldClass,
                                "py-0.5 text-xl font-semibold leading-tight tracking-tight sm:text-2xl"
                            )}
                        />
                        <HouseLocation house={house} onChange={onChange} />
                    </div>
                    <p className="mt-auto text-[11px] leading-relaxed text-muted-foreground">
                        Agregada el {formatShortDate(house.createdAt)} · Último cambio{" "}
                        {formatDateTime(house.updatedAt)}
                    </p>
                </div>
                {house.coordinates && mapsUrl ? (
                    <LocationMap
                        coordinates={house.coordinates}
                        href={mapsUrl}
                        className="h-44 sm:h-48 md:h-auto md:min-h-[9.5rem] md:w-80 md:shrink-0 lg:w-96"
                    />
                ) : null}
            </div>
        </Card>
    );
}
