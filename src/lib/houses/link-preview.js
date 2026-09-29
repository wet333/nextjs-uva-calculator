import { sanitizeHttpUrl } from "@/lib/houses/listing-url";

/**
 * Jina Reader: servicio público con CORS que renderiza la página y devuelve sus meta tags
 * (og:title, og:image, …). Sin API key tiene un límite de ~20 consultas por minuto.
 * Los portales con antibot (Zonaprop, Argenprop en fichas individuales) suelen devolver
 * la página de desafío: eso se detecta y se informa como `blocked`.
 */
const PREVIEW_ENDPOINT = "https://r.jina.ai/";
const PREVIEW_TIMEOUT_MS = 30000;

const CHALLENGE_TITLES = [
    /just a moment/i,
    /human verification/i,
    /attention required/i,
    /access denied/i,
    /forbidden/i,
    /security check/i,
    /captcha/i,
    /are you a robot/i,
    /verificando/i,
];

export class LinkPreviewError extends Error {
    constructor(code, message) {
        super(message ?? code);
        this.name = "LinkPreviewError";
        this.code = code;
    }
}

const inflight = new Map();

function firstText(...values) {
    for (const value of values) {
        const candidate = Array.isArray(value) ? value[0] : value;
        if (typeof candidate === "string" && candidate.trim()) {
            return candidate.trim();
        }
    }
    return "";
}

function resolveImage(value, pageUrl) {
    const raw = firstText(value);
    if (!raw) {
        return null;
    }
    try {
        return sanitizeHttpUrl(new URL(raw, pageUrl).toString());
    } catch {
        return null;
    }
}

/**
 * Abre `url` con Jina Reader y devuelve su `data` (title, metadata con og:*, external, …).
 * Lanza LinkPreviewError si Jina no responde o no pudo abrir la página.
 */
export async function readPageWithJina(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PREVIEW_TIMEOUT_MS);

    let response;
    try {
        response = await fetch(PREVIEW_ENDPOINT, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "X-Retain-Images": "none",
            },
            body: JSON.stringify({ url }),
            signal: controller.signal,
        });
    } catch {
        throw new LinkPreviewError("network");
    } finally {
        clearTimeout(timer);
    }

    if (response.status === 429) {
        throw new LinkPreviewError("rate_limited");
    }
    if (!response.ok) {
        // Jina responde 4xx/5xx cuando no pudo abrir la página de destino.
        throw new LinkPreviewError(response.status >= 500 ? "network" : "blocked");
    }

    const payload = await response.json().catch(() => null);
    return payload?.data ?? {};
}

async function requestPreview(url) {
    const data = await readPageWithJina(url);
    const meta = data.metadata ?? {};
    const title = firstText(meta["og:title"], meta["twitter:title"], data.title);

    if (!title || CHALLENGE_TITLES.some((pattern) => pattern.test(title))) {
        throw new LinkPreviewError("blocked");
    }
    if (typeof data.httpStatus === "number" && data.httpStatus >= 400) {
        throw new LinkPreviewError("blocked");
    }

    return {
        title,
        description: firstText(
            meta["og:description"],
            meta["twitter:description"],
            meta.description,
            data.description
        ),
        image: resolveImage(meta["og:image"] ?? meta["twitter:image"], url),
        siteName: firstText(meta["og:site_name"]),
        source: "auto",
        fetchedAt: new Date().toISOString(),
    };
}

/** Pide la vista previa de un link. Llamadas simultáneas a la misma URL comparten la request. */
export function fetchLinkPreview(url) {
    if (!inflight.has(url)) {
        const request = requestPreview(url).finally(() => inflight.delete(url));
        inflight.set(url, request);
    }
    return inflight.get(url);
}
