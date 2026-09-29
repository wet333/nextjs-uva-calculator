import {
    DEFAULT_HOUSE_CURRENCY,
    HOUSE_CURRENCIES,
    HOUSES_STORE_VERSION,
    UNNAMED_HOUSE_LABEL,
} from "@/constants/houses";
import { sanitizeHttpUrl, titleFromUrl } from "@/lib/houses/listing-url";
import { mapsSearchUrl } from "@/lib/houses/maps-location";

const MAX_TEXT_LENGTH = 5000;
const LOCATION_STATUSES = ["pending", "found", "not_found"];
const MAX_PREVIEW_TITLE_LENGTH = 300;
const MAX_PREVIEW_DESCRIPTION_LENGTH = 600;

export function createId() {
    // crypto.randomUUID solo existe en contextos seguros (https / localhost).
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
    return new Date().toISOString();
}

function cleanText(value, maxLength = MAX_TEXT_LENGTH) {
    if (typeof value !== "string") {
        return "";
    }
    return value.trim().slice(0, maxLength);
}

function cleanIso(value, fallback) {
    if (typeof value === "string" && !Number.isNaN(Date.parse(value))) {
        return value;
    }
    return fallback;
}

function cleanAmount(value) {
    const numeric = typeof value === "string" ? Number(value) : value;
    if (typeof numeric !== "number" || !Number.isFinite(numeric) || numeric <= 0) {
        return "";
    }
    return Math.round(numeric);
}

export function buildEntry(text) {
    const timestamp = nowIso();
    return { id: createId(), text: cleanText(text), createdAt: timestamp, updatedAt: timestamp };
}

export function buildLink(url) {
    return { id: createId(), url, addedAt: nowIso(), preview: null, previewError: null };
}

export function buildHouse({ name = "", url = null } = {}) {
    const timestamp = nowIso();
    return {
        id: createId(),
        name: cleanText(name, 200),
        address: "",
        mapsUrl: null,
        coordinates: null,
        locationStatus: null,
        currency: DEFAULT_HOUSE_CURRENCY,
        askingPrice: "",
        offerPrice: "",
        landArea: "",
        coveredArea: "",
        links: url ? [buildLink(url)] : [],
        notes: [],
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

export function normalizePreview(preview) {
    if (!preview || typeof preview !== "object") {
        return null;
    }
    const title = cleanText(preview.title, MAX_PREVIEW_TITLE_LENGTH);
    const description = cleanText(preview.description, MAX_PREVIEW_DESCRIPTION_LENGTH);
    const image = sanitizeHttpUrl(preview.image);
    if (!title && !description && !image) {
        return null;
    }
    return {
        title,
        description,
        image,
        siteName: cleanText(preview.siteName, 120),
        source: preview.source === "manual" ? "manual" : "auto",
        fetchedAt: cleanIso(preview.fetchedAt, nowIso()),
    };
}

function normalizeEntry(entry) {
    if (!entry || typeof entry !== "object") {
        return null;
    }
    const text = cleanText(entry.text);
    if (!text) {
        return null;
    }
    const createdAt = cleanIso(entry.createdAt, nowIso());
    return {
        id: typeof entry.id === "string" && entry.id ? entry.id : createId(),
        text,
        createdAt,
        updatedAt: cleanIso(entry.updatedAt, createdAt),
    };
}

function normalizeLink(link) {
    const url = sanitizeHttpUrl(link?.url);
    if (!url) {
        return null;
    }
    const code = link.previewError?.code;
    return {
        id: typeof link.id === "string" && link.id ? link.id : createId(),
        url,
        addedAt: cleanIso(link.addedAt, nowIso()),
        preview: normalizePreview(link.preview),
        previewError:
            typeof code === "string"
                ? { code, at: cleanIso(link.previewError.at, nowIso()) }
                : null,
    };
}

function normalizeCoordinates(value) {
    const lat = Number(value?.lat);
    const lng = Number(value?.lng);
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

/** Sin estado guardado (casas anteriores a la ubicación unificada) → se resuelve al abrirla. */
function normalizeLocationStatus(status, { address, mapsUrl, coordinates }) {
    if (!address && !mapsUrl) {
        return null;
    }
    if (LOCATION_STATUSES.includes(status)) {
        return status;
    }
    return coordinates ? "found" : "pending";
}

function normalizeList(list, normalizeItem) {
    if (!Array.isArray(list)) {
        return [];
    }
    return list.map(normalizeItem).filter(Boolean);
}

/** Listas de "Pros y contras" (feature eliminada) y el prefijo con el que pasan a notas. */
const LEGACY_ENTRY_LISTS = { pros: "Pro", cons: "Contra" };

/**
 * Notas de la casa. Si trae pros o contras (localStorage o respaldos viejos), se convierten
 * en notas con prefijo para no perder lo que cargó el usuario.
 */
function normalizeNotes(house) {
    const legacy = Object.entries(LEGACY_ENTRY_LISTS).flatMap(([listKey, prefix]) =>
        normalizeList(house[listKey], normalizeEntry).map((entry) => ({
            ...entry,
            text: `${prefix}: ${entry.text}`,
        }))
    );
    const notes = normalizeList(house.notes, normalizeEntry);
    if (legacy.length === 0) {
        return notes;
    }
    return [...notes, ...legacy].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

/** Acepta datos de localStorage o de un archivo importado y devuelve una casa válida, o null. */
export function normalizeHouse(house) {
    if (!house || typeof house !== "object" || typeof house.id !== "string" || !house.id) {
        return null;
    }
    const createdAt = cleanIso(house.createdAt, nowIso());
    // Campos de ubicación opcionales: los respaldos anteriores no los tienen.
    const location = {
        address: cleanText(house.address, 300),
        mapsUrl: sanitizeHttpUrl(house.mapsUrl),
        coordinates: normalizeCoordinates(house.coordinates),
    };
    return {
        id: house.id,
        name: cleanText(house.name, 200),
        ...location,
        locationStatus: normalizeLocationStatus(house.locationStatus, location),
        currency: HOUSE_CURRENCIES.includes(house.currency)
            ? house.currency
            : DEFAULT_HOUSE_CURRENCY,
        askingPrice: cleanAmount(house.askingPrice),
        offerPrice: cleanAmount(house.offerPrice),
        // m² de terreno y cubiertos (opcionales, "" si no se cargaron).
        landArea: cleanAmount(house.landArea),
        coveredArea: cleanAmount(house.coveredArea),
        links: normalizeList(house.links, normalizeLink),
        notes: normalizeNotes(house),
        createdAt,
        updatedAt: cleanIso(house.updatedAt, createdAt),
    };
}

export function normalizeHouses(houses) {
    if (!Array.isArray(houses)) {
        return [];
    }
    const seen = new Set();
    return houses.map(normalizeHouse).filter((house) => {
        if (!house || seen.has(house.id)) {
            return false;
        }
        seen.add(house.id);
        return true;
    });
}

export function createEmptyStore() {
    return { version: HOUSES_STORE_VERSION, houses: [], updatedAt: null, lastExportedAt: null };
}

export function normalizeStore(raw) {
    if (!raw || typeof raw !== "object") {
        return createEmptyStore();
    }
    return {
        version: HOUSES_STORE_VERSION,
        houses: normalizeHouses(raw.houses),
        updatedAt: cleanIso(raw.updatedAt, null),
        lastExportedAt: cleanIso(raw.lastExportedAt, null),
    };
}

/* ---------- Transformaciones puras sobre una casa ---------- */

export function addEntry(house, listKey, text) {
    const entry = buildEntry(text);
    if (!entry.text) {
        return house;
    }
    return { ...house, [listKey]: [...house[listKey], entry] };
}

export function updateEntry(house, listKey, entryId, text) {
    const nextText = cleanText(text);
    if (!nextText) {
        return house;
    }
    return {
        ...house,
        [listKey]: house[listKey].map((entry) =>
            entry.id === entryId && entry.text !== nextText
                ? { ...entry, text: nextText, updatedAt: nowIso() }
                : entry
        ),
    };
}

export function removeEntry(house, listKey, entryId) {
    return { ...house, [listKey]: house[listKey].filter((entry) => entry.id !== entryId) };
}

export function hasLink(house, url) {
    return house.links.some((link) => link.url === url);
}

export function addLink(house, url) {
    if (hasLink(house, url)) {
        return house;
    }
    return { ...house, links: [...house.links, buildLink(url)] };
}

export function patchLink(house, linkId, patch) {
    return {
        ...house,
        links: house.links.map((link) => (link.id === linkId ? { ...link, ...patch } : link)),
    };
}

export function removeLink(house, linkId) {
    return { ...house, links: house.links.filter((link) => link.id !== linkId) };
}

/**
 * Nueva ubicación desde el campo unificado (ver `parseLocationInput`). Un link reemplaza la
 * dirección (se completa al resolverlo); una dirección descarta el link anterior.
 */
export function setLocation(house, parsed) {
    const base = { ...house, coordinates: null, locationStatus: "pending" };
    if (parsed.kind === "link") {
        return { ...base, mapsUrl: parsed.url, address: "" };
    }
    return { ...base, mapsUrl: null, address: parsed.address };
}

export function clearLocation(house) {
    return { ...house, address: "", mapsUrl: null, coordinates: null, locationStatus: null };
}

export function retryLocation(house) {
    return { ...house, locationStatus: "pending" };
}

/**
 * Aplica lo que devolvió `resolveLocation` solo si la ubicación no cambió mientras se buscaba.
 * Una dirección escrita por el usuario nunca se pisa.
 */
export function applyLocationResult(house, target, result) {
    if (house.mapsUrl !== target.mapsUrl || house.address !== target.address) {
        return house;
    }
    const coordinates = normalizeCoordinates(result.coordinates);
    return {
        ...house,
        address: house.address || cleanText(result.address, 300),
        coordinates,
        locationStatus: coordinates ? "found" : "not_found",
    };
}

/* ---------- Derivados para la UI ---------- */

/** Link para abrir la casa en Google Maps: el pegado por el usuario o una búsqueda de la dirección. */
export function getHouseMapsUrl(house) {
    if (house.mapsUrl) {
        return house.mapsUrl;
    }
    return house.address ? mapsSearchUrl(house.address) : null;
}

export function getHouseDisplayName(house) {
    if (house.name) {
        return house.name;
    }
    const firstLink = house.links[0];
    if (firstLink) {
        return firstLink.preview?.title || titleFromUrl(firstLink.url) || UNNAMED_HOUSE_LABEL;
    }
    return UNNAMED_HOUSE_LABEL;
}

export function getHouseCoverImage(house) {
    return house.links.find((link) => link.preview?.image)?.preview.image ?? null;
}
