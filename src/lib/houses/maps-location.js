import { sanitizeHttpUrl } from "@/lib/houses/listing-url";

/** "-34.5889, -58.4302": lo que copia Google Maps al hacer clic derecho sobre el mapa. */
const COORDINATES_PATTERN = /^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/;
/** Pin exacto dentro de los datos de un link de Google Maps: `!3d<lat>!4d<lng>`. */
const PIN_PATTERN = /!3d(-?\d{1,2}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/;
/** Centro de la vista: `/@<lat>,<lng>,17z`. Aproximado (puede estar corrido del pin). */
const VIEWPORT_PATTERN = /@(-?\d{1,2}(?:\.\d+)?),(-?\d{1,3}(?:\.\d+)?)/;
/** Código postal argentino (CPA) que Google antepone a la localidad: "B7000 Tandil". */
const CPA_PATTERN = /\b[A-Z]\d{4}[A-Z]{0,3}\s+/g;

/** URL oficial de búsqueda de Google Maps (no requiere API key). */
export function mapsSearchUrl(query) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function toCoordinates(latText, lngText) {
    const lat = Number(latText);
    const lng = Number(lngText);
    if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng) ||
        Math.abs(lat) > 90 ||
        Math.abs(lng) > 180
    ) {
        return null;
    }
    return { lat, lng };
}

export function parseCoordinates(text) {
    const match = typeof text === "string" ? text.trim().match(COORDINATES_PATTERN) : null;
    return match ? toCoordinates(match[1], match[2]) : null;
}

/**
 * Clasifica lo que escribe o pega el usuario en el campo de ubicación:
 * - `{ kind: "link", url }` para un link o coordenadas (se guardan como link de búsqueda),
 * - `{ kind: "address", address }` para texto libre,
 * - null si está vacío o es un link inválido.
 */
export function parseLocationInput(raw) {
    const text = typeof raw === "string" ? raw.trim() : "";
    if (!text) {
        return null;
    }
    const coordinates = parseCoordinates(text);
    if (coordinates) {
        return { kind: "link", url: mapsSearchUrl(`${coordinates.lat},${coordinates.lng}`) };
    }
    if (/^https?:\/\//i.test(text) || /^(www\.|maps\.|goo\.gl\/)/i.test(text)) {
        const url = sanitizeHttpUrl(text);
        return url ? { kind: "link", url } : null;
    }
    return { kind: "address", address: text.slice(0, 300) };
}

export function isGoogleMapsUrl(url) {
    try {
        const { hostname, pathname } = new URL(url);
        const host = hostname.replace(/^www\./, "");
        return (
            host === "maps.app.goo.gl" ||
            /^maps\.google\.[a-z.]+$/.test(host) ||
            ((host === "goo.gl" || /^google\.[a-z.]+$/.test(host)) && pathname.startsWith("/maps"))
        );
    } catch {
        return false;
    }
}

/** Links cortos de "Compartir": hay que seguir la redirección para leer la ubicación. */
export function isShortMapsUrl(url) {
    try {
        const { hostname, pathname } = new URL(url);
        return (
            hostname === "maps.app.goo.gl" ||
            (hostname === "goo.gl" && pathname.startsWith("/maps"))
        );
    } catch {
        return false;
    }
}

function decodeSegment(segment) {
    try {
        return decodeURIComponent(segment.replace(/\+/g, " "));
    } catch {
        return segment.replace(/\+/g, " ");
    }
}

/** "Payró 1349, B7000 Tandil, Provincia de Buenos Aires, Argentina" → sin CPA ni país. */
export function tidyAddress(text) {
    return text
        .replace(CPA_PATTERN, "")
        .replace(/,\s*Argentina$/i, "")
        .replace(/\s{2,}/g, " ")
        .trim();
}

/**
 * Lee dirección y coordenadas de un link largo de Google Maps (o de las URLs internas que
 * devuelve Jina al abrir un link corto). Devuelve lo que encuentre; los campos pueden ser null.
 */
export function readMapsUrl(url) {
    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return { address: null, coordinates: null, exact: false };
    }

    const params = parsed.searchParams;
    const query = params.get("q") ?? params.get("query") ?? params.get("destination");
    const pinSource = `${parsed.pathname}${decodeSegment(params.get("pb") ?? "")}`;
    const pin = pinSource.match(PIN_PATTERN);
    const viewport = parsed.pathname.match(VIEWPORT_PATTERN);
    const place = parsed.pathname.match(/\/maps\/(?:place|search)\/([^/@]+)/);

    let coordinates = pin ? toCoordinates(pin[1], pin[2]) : null;
    let exact = Boolean(coordinates);
    let address = place ? decodeSegment(place[1]) : null;

    if (query) {
        const queryCoordinates = parseCoordinates(query);
        if (queryCoordinates && !coordinates) {
            coordinates = queryCoordinates;
            exact = true;
        } else if (!queryCoordinates && !address) {
            address = query;
        }
    }
    if (address && parseCoordinates(address)) {
        address = null;
    }
    if (!coordinates && viewport) {
        coordinates = toCoordinates(viewport[1], viewport[2]);
    }

    return { address: address ? tidyAddress(address) : null, coordinates, exact };
}
