/** Portales conocidos: la clave se busca dentro del hostname. */
const KNOWN_PORTALS = [
    { match: "zonaprop", name: "Zonaprop" },
    { match: "argenprop", name: "Argenprop" },
    { match: "mercadolibre", name: "Mercado Libre" },
    { match: "remax", name: "RE/MAX" },
    { match: "properati", name: "Properati" },
    { match: "casasdehoy", name: "Casasdehoy" },
    { match: "century21", name: "Century 21" },
];

/** Zonaprop antepone un código al slug (ej. `veclapin-4-ambientes-…`). */
const ZONAPROP_SLUG_PREFIX = /^(ve|al)cl[a-z]{2,3}in$/;

/**
 * Devuelve la URL normalizada si es http(s), o null. Si falta el protocolo asume https.
 * Evita guardar (o importar) hrefs peligrosos como `javascript:`.
 */
export function sanitizeHttpUrl(raw) {
    if (typeof raw !== "string") {
        return null;
    }
    const trimmed = raw.trim();
    if (!trimmed) {
        return null;
    }
    const candidate = /^[a-z][a-z\d+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
        const url = new URL(candidate);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
            return null;
        }
        if (!url.hostname.includes(".")) {
            return null;
        }
        return url.toString();
    } catch {
        return null;
    }
}

function parseUrl(url) {
    try {
        return new URL(url);
    } catch {
        return null;
    }
}

function bareHostname(hostname) {
    return hostname.replace(/^www\./, "");
}

export function getPortal(url) {
    const parsed = parseUrl(url);
    if (!parsed) {
        return { name: "Link", hostname: "" };
    }
    const hostname = bareHostname(parsed.hostname);
    const known = KNOWN_PORTALS.find((portal) => hostname.includes(portal.match));
    return { name: known?.name ?? hostname, hostname, known: Boolean(known) };
}

export function faviconUrl(url) {
    const parsed = parseUrl(url);
    if (!parsed) {
        return null;
    }
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.hostname)}&sz=64`;
}

export function displayUrl(url) {
    const parsed = parseUrl(url);
    if (!parsed) {
        return url;
    }
    const path = parsed.pathname === "/" ? "" : decodeSafe(parsed.pathname);
    return `${bareHostname(parsed.hostname)}${path}`;
}

function decodeSafe(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

/**
 * Título legible derivado del slug de la publicación, para cuando no hay vista previa.
 * `…/departamento-en-venta-en-palermo-3-ambientes--12345678` → "Departamento en venta en palermo 3 ambientes".
 */
export function titleFromUrl(url) {
    const parsed = parseUrl(url);
    if (!parsed) {
        return null;
    }
    const segment = parsed.pathname.split("/").filter(Boolean).pop();
    if (!segment) {
        return null;
    }
    const words = decodeSafe(segment)
        .replace(/\.(html?|php|aspx?)$/i, "")
        .split(/[-_+\s]+/)
        .filter(Boolean);

    if (words.length > 1 && /^\d{5,}$/.test(words[words.length - 1])) {
        words.pop();
    }
    if (getPortal(url).name === "Zonaprop" && ZONAPROP_SLUG_PREFIX.test(words[0] ?? "")) {
        words.shift();
    }

    const text = words.join(" ").trim();
    if ((text.match(/\p{L}/gu) ?? []).length < 3) {
        return null;
    }
    const title = text.charAt(0).toUpperCase() + text.slice(1);
    return title.length > 120 ? `${title.slice(0, 117)}…` : title;
}
