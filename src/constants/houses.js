// El prefijo "uva-calculator" es anterior al nombre HomeHunt: no cambiarlo o las casas ya
// guardadas en el navegador dejarían de encontrarse.
export const HOUSES_STORAGE_KEY = "uva-calculator:houses";
export const HOUSES_STORE_VERSION = 1;

export const HOUSES_BACKUP_KIND = "mis-casas-backup";
export const HOUSES_BACKUP_FILE_PREFIX = "homehunt-casas";

/** Honorarios redondeados que se suman al precio para estimar el costo real de compra. */
export const PURCHASE_FEES_RATE = 0.15;

export const HOUSE_CURRENCIES = ["USD", "ARS"];
export const DEFAULT_HOUSE_CURRENCY = "USD";

export const UNNAMED_HOUSE_LABEL = "Casa sin nombre";

export const LINK_PREVIEW_ERRORS = {
    blocked: "El sitio bloquea la lectura automática. Podés completar la vista previa a mano.",
    rate_limited: "Demasiadas consultas seguidas. Probá de nuevo en un minuto.",
    network: "No se pudo obtener la vista previa. Revisá tu conexión y reintentá.",
};
