"use client";

import { useState } from "react";
import { House, Link2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputWithIcon } from "@/components/forms/InputWithIcon";
import { sanitizeHttpUrl } from "@/lib/houses/listing-url";

export function NewHouseForm({ onCreate, disabled }) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [errors, setErrors] = useState({});

    const onSubmit = (event) => {
        event.preventDefault();
        const trimmedUrl = url.trim();
        const safeUrl = trimmedUrl ? sanitizeHttpUrl(trimmedUrl) : null;

        if (trimmedUrl && !safeUrl) {
            setErrors({ url: "Pegá un link válido, por ejemplo https://www.zonaprop.com.ar/…" });
            return;
        }
        if (!name.trim() && !safeUrl) {
            setErrors({ name: "Poné un nombre o pegá el link de la publicación." });
            return;
        }

        setErrors({});
        onCreate({ name, url: safeUrl });
    };

    return (
        <form
            onSubmit={onSubmit}
            noValidate
            className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto] md:items-start"
        >
            <InputWithIcon
                labelText="Nombre"
                htmlFor="newHouseName"
                icon={House}
                helpMsg="Algo que te ayude a reconocerla. Si lo dejás vacío se usa el título de la publicación."
                error={errors.name}
            >
                <Input
                    id="newHouseName"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Ej. PH 3 ambientes en Villa Urquiza"
                    maxLength={200}
                    autoComplete="off"
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? "newHouseName-error" : undefined}
                />
            </InputWithIcon>
            <InputWithIcon
                labelText="Link de la publicación"
                htmlFor="newHouseUrl"
                icon={Link2}
                helpMsg="Opcional. Zonaprop, Argenprop, Mercado Libre, una inmobiliaria… Después podés sumar más links."
                error={errors.url}
            >
                <Input
                    id="newHouseUrl"
                    type="url"
                    inputMode="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://www.zonaprop.com.ar/propiedades/…"
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={errors.url ? true : undefined}
                    aria-describedby={errors.url ? "newHouseUrl-error" : undefined}
                />
            </InputWithIcon>
            <Button
                type="submit"
                variant="cta"
                className="w-full md:mt-[1.625rem] md:w-auto"
                disabled={disabled}
            >
                <Plus aria-hidden="true" />
                Agregar casa
            </Button>
        </form>
    );
}
