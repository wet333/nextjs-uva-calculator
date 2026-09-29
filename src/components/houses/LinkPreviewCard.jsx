"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Globe, Loader2, Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InlineConfirmDelete } from "@/components/houses/InlineConfirmDelete";
import { RemoteImage } from "@/components/houses/RemoteImage";
import { LINK_PREVIEW_ERRORS } from "@/constants/houses";
import { normalizePreview } from "@/lib/houses/house-model";
import { fetchLinkPreview, LinkPreviewError } from "@/lib/houses/link-preview";
import { displayUrl, faviconUrl, getPortal, titleFromUrl } from "@/lib/houses/listing-url";

function ManualPreviewForm({ link, onSave, onCancel }) {
    const [values, setValues] = useState({
        title: link.preview?.title ?? titleFromUrl(link.url) ?? "",
        description: link.preview?.description ?? "",
        image: link.preview?.image ?? "",
    });
    const idPrefix = `preview-${link.id}`;
    const preview = normalizePreview({
        ...values,
        siteName: link.preview?.siteName,
        source: "manual",
    });

    const setField = (field) => (event) =>
        setValues((prev) => ({ ...prev, [field]: event.target.value }));

    return (
        <form
            className="space-y-3 p-4"
            onSubmit={(event) => {
                event.preventDefault();
                if (preview) {
                    onSave(preview);
                }
            }}
            onKeyDown={(event) => {
                if (event.key === "Escape") {
                    onCancel();
                }
            }}
        >
            <p className="text-xs text-muted-foreground">
                Completá la vista previa a mano. Tip: en la publicación, clic derecho sobre la foto
                → «Copiar dirección de imagen».
            </p>
            <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-title`}>Título</Label>
                <Input
                    id={`${idPrefix}-title`}
                    value={values.title}
                    maxLength={300}
                    autoFocus
                    onChange={setField("title")}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-description`}>Descripción</Label>
                <Textarea
                    id={`${idPrefix}-description`}
                    value={values.description}
                    rows={2}
                    maxLength={600}
                    className="max-h-40"
                    onChange={setField("description")}
                />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor={`${idPrefix}-image`}>URL de la imagen</Label>
                <Input
                    id={`${idPrefix}-image`}
                    type="url"
                    inputMode="url"
                    value={values.image}
                    placeholder="https://…"
                    spellCheck={false}
                    onChange={setField("image")}
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button variant="ghost" className="h-8 px-3 text-xs" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    variant="secondary"
                    className="h-8 px-3 text-xs"
                    disabled={!preview}
                >
                    Guardar vista previa
                </Button>
            </div>
        </form>
    );
}

export function LinkPreviewCard({ link, onPatch, onRemove }) {
    const [editing, setEditing] = useState(false);
    const onPatchRef = useRef(onPatch);

    // Sin vista previa ni error = hay que buscarla (link nuevo, "Reintentar" o fetch interrumpido).
    const loading = !link.preview && !link.previewError;

    useEffect(() => {
        onPatchRef.current = onPatch;
    });

    useEffect(() => {
        if (!loading) {
            return;
        }
        fetchLinkPreview(link.url)
            .then((preview) => {
                onPatchRef.current({ preview: normalizePreview(preview), previewError: null });
            })
            .catch((error) => {
                const code = error instanceof LinkPreviewError ? error.code : "network";
                onPatchRef.current({ previewError: { code, at: new Date().toISOString() } });
            });
    }, [loading, link.url]);

    const portal = getPortal(link.url);
    const preview = link.preview;
    const title = preview?.title || titleFromUrl(link.url) || displayUrl(link.url);
    const errorMessage =
        !preview && link.previewError
            ? (LINK_PREVIEW_ERRORS[link.previewError.code] ?? LINK_PREVIEW_ERRORS.network)
            : null;

    return (
        <article className="overflow-hidden rounded-lg border-l-2 border-l-primary/60 bg-white/[0.02] ring-1 ring-white/[0.06]">
            {editing ? (
                <ManualPreviewForm
                    link={link}
                    onCancel={() => setEditing(false)}
                    onSave={(manualPreview) => {
                        onPatch({ preview: manualPreview, previewError: null });
                        setEditing(false);
                    }}
                />
            ) : (
                <div className="flex flex-col sm:flex-row">
                    {preview?.image ? (
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            tabIndex={-1}
                            aria-hidden="true"
                            className="block aspect-[16/9] shrink-0 overflow-hidden bg-white/[0.03] sm:aspect-auto sm:w-44"
                        >
                            <RemoteImage
                                src={preview.image}
                                fallback={
                                    <div className="flex h-full w-full items-center justify-center">
                                        <Globe
                                            className="h-6 w-6 text-muted-foreground/40"
                                            aria-hidden="true"
                                        />
                                    </div>
                                }
                            />
                        </a>
                    ) : null}
                    <div className="min-w-0 flex-1 p-3 sm:p-4">
                        <div className="flex items-start gap-2">
                            <div className="flex min-w-0 flex-1 items-center gap-2 pt-1.5 text-xs text-muted-foreground">
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                                    <RemoteImage
                                        src={faviconUrl(link.url)}
                                        className="h-4 w-4 rounded-sm object-contain"
                                        fallback={
                                            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                                        }
                                    />
                                </span>
                                <span className="truncate font-medium">
                                    {preview?.siteName || portal.name}
                                </span>
                            </div>
                            <div className="-mr-1.5 -mt-0.5 flex shrink-0 items-center">
                                <Button
                                    asChild
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                >
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Abrir publicación en otra pestaña"
                                        title="Abrir publicación"
                                    >
                                        <ExternalLink aria-hidden="true" />
                                    </a>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    aria-label="Editar vista previa"
                                    title="Editar vista previa"
                                    disabled={loading}
                                    onClick={() => setEditing(true)}
                                >
                                    <Pencil aria-hidden="true" />
                                </Button>
                                <InlineConfirmDelete
                                    label="Quitar link"
                                    confirmLabel="Quitar"
                                    onConfirm={onRemove}
                                />
                            </div>
                        </div>
                        <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 line-clamp-2 break-words text-sm font-semibold leading-snug text-primary underline-offset-2 hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        >
                            {title}
                        </a>
                        {preview?.description ? (
                            <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                                {preview.description}
                            </p>
                        ) : null}
                        {loading ? (
                            <p
                                role="status"
                                className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"
                            >
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                                Buscando vista previa…
                            </p>
                        ) : errorMessage ? (
                            <div className="mt-2 space-y-1.5">
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    {errorMessage}
                                </p>
                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                        onClick={() => onPatch({ previewError: null })}
                                    >
                                        <RefreshCw className="h-3 w-3" aria-hidden="true" />
                                        Reintentar
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                                        onClick={() => setEditing(true)}
                                    >
                                        <Pencil className="h-3 w-3" aria-hidden="true" />
                                        Completar a mano
                                    </button>
                                </div>
                            </div>
                        ) : null}
                        <p className="mt-2 truncate text-[11px] text-muted-foreground/70">
                            {displayUrl(link.url)}
                        </p>
                    </div>
                </div>
            )}
        </article>
    );
}
