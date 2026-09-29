"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Imagen de otro dominio (og:image de la publicación). Sin referrer para esquivar bloqueos de
 * hotlinking; si falla la carga se muestra `fallback`.
 */
export function RemoteImage({ src, alt = "", className, fallback = null }) {
    const [failedSrc, setFailedSrc] = useState(null);

    if (!src || failedSrc === src) {
        return fallback;
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailedSrc(src)}
            className={cn("h-full w-full object-cover", className)}
        />
    );
}
