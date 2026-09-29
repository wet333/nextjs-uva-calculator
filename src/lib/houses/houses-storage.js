import {
    HOUSES_BACKUP_FILE_PREFIX,
    HOUSES_BACKUP_KIND,
    HOUSES_STORAGE_KEY,
    HOUSES_STORE_VERSION,
} from "@/constants/houses";
import { createEmptyStore, normalizeHouses, normalizeStore } from "@/lib/houses/house-model";

/* ---------- localStorage ---------- */

export function readHousesStore() {
    try {
        const raw = window.localStorage.getItem(HOUSES_STORAGE_KEY);
        return raw ? normalizeStore(JSON.parse(raw)) : createEmptyStore();
    } catch (error) {
        console.error("Error leyendo casas guardadas:", error);
        return createEmptyStore();
    }
}

/** Lanza si el navegador bloquea localStorage o se llenó la cuota. */
export function writeHousesStore(store) {
    window.localStorage.setItem(HOUSES_STORAGE_KEY, JSON.stringify(store));
}

/* ---------- Exportar / importar ---------- */

export function buildBackupFile(houses) {
    const exportedAt = new Date().toISOString();
    const payload = {
        kind: HOUSES_BACKUP_KIND,
        version: HOUSES_STORE_VERSION,
        exportedAt,
        houses,
    };
    return {
        fileName: `${HOUSES_BACKUP_FILE_PREFIX}-${exportedAt.slice(0, 10)}.json`,
        contents: JSON.stringify(payload, null, 2),
        exportedAt,
    };
}

export function downloadTextFile(fileName, contents) {
    const blob = new Blob([contents], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(href), 0);
}

/**
 * Acepta el formato de respaldo, el objeto guardado en localStorage o un array de casas.
 * Devuelve las casas normalizadas o lanza un Error con mensaje para mostrar.
 */
export function parseBackupFile(text) {
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch {
        throw new Error("El archivo no es un JSON válido.");
    }

    const rawHouses = Array.isArray(parsed) ? parsed : parsed?.houses;
    if (!Array.isArray(rawHouses)) {
        throw new Error("El archivo no parece un respaldo de Mis casas.");
    }

    const houses = normalizeHouses(rawHouses);
    if (rawHouses.length > 0 && houses.length === 0) {
        throw new Error("El respaldo no tiene casas válidas para importar.");
    }
    return houses;
}

/**
 * Une casas importadas con las actuales por id. Si la casa ya existe, gana la versión con
 * `updatedAt` más reciente, así importar un respaldo viejo no pisa cambios nuevos.
 */
export function mergeHouses(current, imported) {
    const byId = new Map(current.map((house) => [house.id, house]));
    const result = { added: 0, updated: 0, unchanged: 0 };

    for (const house of imported) {
        const existing = byId.get(house.id);
        if (!existing) {
            byId.set(house.id, house);
            result.added += 1;
        } else if (Date.parse(house.updatedAt) > Date.parse(existing.updatedAt)) {
            byId.set(house.id, house);
            result.updated += 1;
        } else {
            result.unchanged += 1;
        }
    }

    return { houses: Array.from(byId.values()), result };
}
