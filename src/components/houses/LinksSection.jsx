"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LinkPreviewCard } from "@/components/houses/LinkPreviewCard";
import { addLink, hasLink, patchLink, removeLink } from "@/lib/houses/house-model";
import { sanitizeHttpUrl } from "@/lib/houses/listing-url";

export function LinksSection({ house, onChange, className }) {
    const [draft, setDraft] = useState("");
    const [error, setError] = useState(null);
    const inputId = `house-link-${house.id}`;

    const onSubmit = (event) => {
        event.preventDefault();
        const url = sanitizeHttpUrl(draft);
        if (!url) {
            setError("Pegá un link válido, por ejemplo https://www.argenprop.com/…");
            return;
        }
        if (hasLink(house, url)) {
            setError("Ese link ya está en la lista.");
            return;
        }
        onChange((current) => addLink(current, url));
        setDraft("");
        setError(null);
    };

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle tag="h2">Publicaciones</CardTitle>
                <CardDescription>
                    Los links de esta casa en Zonaprop, Argenprop, Mercado Libre o inmobiliarias.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
                {house.links.length > 0 ? (
                    <ul className="space-y-3">
                        {house.links.map((link) => (
                            <li key={link.id}>
                                <LinkPreviewCard
                                    link={link}
                                    onPatch={(patch) =>
                                        onChange((current) => patchLink(current, link.id, patch))
                                    }
                                    onRemove={() =>
                                        onChange((current) => removeLink(current, link.id))
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Todavía no agregaste links. Pegá el de la publicación para ver su vista
                        previa.
                    </p>
                )}
                <form onSubmit={onSubmit} noValidate className="space-y-1.5">
                    <label htmlFor={inputId} className="sr-only">
                        Link de otra publicación
                    </label>
                    <div className="flex gap-2">
                        <Input
                            id={inputId}
                            type="url"
                            inputMode="url"
                            value={draft}
                            placeholder="Pegá otro link…"
                            autoComplete="off"
                            spellCheck={false}
                            className="min-w-0 flex-1"
                            aria-invalid={error ? true : undefined}
                            aria-describedby={error ? `${inputId}-error` : undefined}
                            onChange={(event) => {
                                setDraft(event.target.value);
                                setError(null);
                            }}
                        />
                        <Button
                            type="submit"
                            variant="outline"
                            className="shrink-0 px-3"
                            disabled={!draft.trim()}
                        >
                            <Plus aria-hidden="true" />
                            <span className="sr-only sm:not-sr-only">Agregar</span>
                        </Button>
                    </div>
                    {error ? (
                        <p
                            id={`${inputId}-error`}
                            role="alert"
                            className="text-xs leading-relaxed text-destructive"
                        >
                            {error}
                        </p>
                    ) : null}
                </form>
            </CardContent>
        </Card>
    );
}
