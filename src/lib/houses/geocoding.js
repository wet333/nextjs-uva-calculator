import { readPageWithJina } from "@/lib/houses/link-preview";
import {
    isShortMapsUrl,
    parseCoordinates,
    readMapsUrl,
    tidyAddress,
} from "@/lib/houses/maps-location";

/**
 * Nominatim (OpenStreetMap): dirección ↔ coordenadas, gratis y con CORS.
 * Política de uso: máximo 1 consulta por segundo y nada de autocompletar mientras se escribe;
 * por eso las consultas pasan por una cola y solo se hacen al guardar la ubicación.
 */
const NOMINATIM_URL = "https://nominatim.openstreetmap.org";
const NOMINATIM_INTERVAL_MS = 1100;

let nominatimQueue = Promise.resolve();
let lastNominatimAt = 0;

function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function queryNominatim(path, params) {
    const run = nominatimQueue.then(async () => {
        const delay = lastNominatimAt + NOMINATIM_INTERVAL_MS - Date.now();
        if (delay > 0) {
            await wait(delay);
        }
        lastNominatimAt = Date.now();
        const search = new URLSearchParams({
            format: "jsonv2",
            "accept-language": "es",
            ...params,
        });
        const response = await fetch(`${NOMINATIM_URL}/${path}?${search}`, {
            headers: { Accept: "application/json" },
        });
        if (!response.ok) {
            throw new Error(`Nominatim respondió ${response.status}`);
        }
        return response.json();
    });
    nominatimQueue = run.catch(() => {});
    return run;
}

function toCoordinates(result) {
    const lat = Number(result?.lat);
    const lng = Number(result?.lon);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

/** Busca primero en Argentina y, si no aparece, en cualquier país. */
export async function geocodeAddress(address) {
    const local = await queryNominatim("search", { q: address, limit: "1", countrycodes: "ar" });
    if (local[0]) {
        return toCoordinates(local[0]);
    }
    const global = await queryNominatim("search", { q: address, limit: "1" });
    return toCoordinates(global[0]);
}

/** "Payró 1349, Tandil": calle y altura + localidad. */
export async function reverseGeocode({ lat, lng }) {
    const result = await queryNominatim("reverse", {
        lat: String(lat),
        lon: String(lng),
        zoom: "18",
        addressdetails: "1",
    });
    const parts = result?.address ?? {};
    const street = [parts.road ?? parts.pedestrian, parts.house_number].filter(Boolean).join(" ");
    const locality = parts.city ?? parts.town ?? parts.village ?? parts.suburb;
    const short = [street, locality].filter(Boolean).join(", ");
    return short || (result?.display_name ? tidyAddress(result.display_name) : null);
}

/**
 * Los links cortos redirigen a Google Maps sin CORS, así que se abren con Jina. Su respuesta
 * trae URLs internas de Google con la dirección (`q=`) y el pin (`!3d…!4d…`), y una imagen
 * estática centrada en el lugar como último recurso.
 */
async function readShortMapsUrl(url) {
    const data = await readPageWithJina(url);
    const candidates = [data.url, ...Object.keys(data.external?.preload ?? {})].filter(
        (candidate) => typeof candidate === "string"
    );

    const found = { address: null, coordinates: null, exact: false };
    for (const candidate of candidates) {
        const info = readMapsUrl(candidate);
        found.address = found.address ?? info.address;
        if (info.coordinates && (!found.coordinates || (info.exact && !found.exact))) {
            found.coordinates = info.coordinates;
            found.exact = info.exact;
        }
    }

    if (!found.coordinates && typeof data.metadata?.["og:image"] === "string") {
        try {
            const center = new URL(data.metadata["og:image"]).searchParams.get("center");
            found.coordinates = parseCoordinates(center);
        } catch {
            // og:image no es una URL: se ignora.
        }
    }
    return found;
}

async function attempt(task, fallback = null) {
    try {
        return await task();
    } catch (error) {
        console.error("Error resolviendo ubicación:", error);
        return fallback;
    }
}

async function lookupLocation({ mapsUrl, address }) {
    if (!mapsUrl) {
        return {
            address: null,
            coordinates: address ? await attempt(() => geocodeAddress(address)) : null,
        };
    }

    let found = readMapsUrl(mapsUrl);
    if (!found.coordinates && !found.address && isShortMapsUrl(mapsUrl)) {
        found = await attempt(() => readShortMapsUrl(mapsUrl), found);
    }
    if (found.address && !found.exact) {
        // El centro de la vista puede estar corrido del lugar: la dirección es más precisa.
        const geocoded = await attempt(() => geocodeAddress(found.address));
        found = { ...found, coordinates: geocoded ?? found.coordinates };
    }
    if (found.coordinates && !found.address) {
        found = { ...found, address: await attempt(() => reverseGeocode(found.coordinates)) };
    }
    return { address: found.address, coordinates: found.coordinates };
}

const inflight = new Map();

/**
 * Completa lo que falta de una ubicación: desde un link obtiene dirección y coordenadas; desde
 * una dirección, las coordenadas. Nunca lanza: si algo falla, esos campos vuelven en null.
 */
export function resolveLocation(target) {
    const key = `${target.mapsUrl ?? ""}|${target.address ?? ""}`;
    if (!inflight.has(key)) {
        inflight.set(
            key,
            lookupLocation(target).finally(() => inflight.delete(key))
        );
    }
    return inflight.get(key);
}
