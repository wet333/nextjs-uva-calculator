# Notas para Claude

Reglas del proyecto que valen para cualquier cambio. Leelas antes de proponer arquitectura o agregar funcionalidad.

**Proyecto:** HomeHunt, herramienta de ayuda para comprar casa en Argentina (antes _Simulador UVA Hipotecarios_). Secciones: **Simulador UVA** (`/`) y **Mis casas** (`/casas`). Los textos nuevos hablan de HomeHunt, no de "el simulador", salvo dentro de la pestaña del simulador.

## 1. Todo corre en el frontend

- **No hay backend propio.** No agregar API routes (`src/app/api/`), server actions, bases de datos ni servicios que haya que desplegar o mantener.
- Si hace falta un dato externo, usar **APIs públicas con CORS** llamadas desde el navegador (hoy: DolarAPI, argentinadatos, Jina Reader, Nominatim y el embed de OpenStreetMap). Si la API no tiene CORS o requiere una clave secreta, no sirve: buscar otra alternativa o proponer una solución manual.
- Las páginas nuevas son client components (`"use client"`) o leen datos en el cliente. Los `layout.js` de servidor se usan solo para `metadata` y para envolver providers.

## 2. Persistencia = localStorage + exportar / importar

- Todo lo que el usuario cargue y deba sobrevivir a una recarga se guarda en **`localStorage`**.
- **Siempre exportable e importable** como archivo JSON. Si se agrega un dato persistente nuevo, tiene que viajar en el respaldo; no alcanza con guardarlo en localStorage. Motivo: al borrar la caché o cambiar de navegador se pierde todo, y el respaldo es la única forma de recuperarlo.
- Usar una clave con prefijo del proyecto (`uva-calculator:<feature>`) y un campo `version` en lo guardado, para poder migrar el formato sin romper respaldos viejos. El prefijo es del nombre anterior: **no renombrar claves existentes** (los datos guardados quedarían huérfanos); las features nuevas usan el mismo prefijo por consistencia.
- Al leer localStorage o un archivo importado, **normalizar y validar** todo (tipos, fechas, largos) y descartar lo inválido. En particular, solo aceptar URLs `http:`/`https:` para no renderizar `javascript:` en un `href`.
- localStorage no existe en el servidor: leerlo en un `useEffect` y mostrar un estado de carga hasta tenerlo (evita errores de hidratación).

## 3. Implementación actual (Mis casas)

| Qué                    | Dónde                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| Clave de localStorage  | `uva-calculator:houses` → `{ version, houses, updatedAt, lastExportedAt }`                          |
| Modelo y normalización | `src/lib/houses/house-model.js` (`normalizeStore`, `normalizeHouse`, helpers puros de cada lista)   |
| Leer / escribir / JSON | `src/lib/houses/houses-storage.js` (`readHousesStore`, `buildBackupFile`, `parseBackupFile`, merge) |
| Estado en React        | `src/components/providers/HousesProvider.jsx` (`useHouses`), sincroniza entre pestañas              |
| UI de respaldo         | `src/components/houses/HousesBackupBar.jsx`                                                         |

- El respaldo es `{ kind: "mis-casas-backup", version, exportedAt, houses }`. Importar **une por id** y, si la casa ya existe, gana el `updatedAt` más reciente (importar un respaldo viejo no pisa cambios nuevos).
- Si cambiás la forma de una casa: subí `HOUSES_STORE_VERSION`, hacé que `normalizeHouse` acepte también el formato anterior y verificá que un respaldo viejo se siga importando.
- Un campo **opcional nuevo** (como `mapsUrl`, `coordinates`, `landArea` o `coveredArea`) no necesita subir la versión: alcanza con que `normalizeHouse` le dé un valor por defecto cuando falta, así los respaldos viejos se siguen importando.
- Si se **elimina** una feature con datos del usuario, no se descartan en silencio: se migran a algo que siga existiendo. Ejemplo: "Pros y contras" se eliminó y `normalizeNotes` convierte esos ítems en notas con prefijo "Pro:" / "Contra:" (también al importar respaldos viejos).

## 4. Vista previa de links

- Se usa **Jina Reader** (`POST https://r.jina.ai/`, gratis, ~20 consultas por minuto sin clave) para leer los `og:*` de la publicación. La URL de la publicación se envía a ese servicio.
- Zonaprop y Argenprop protegen las fichas con antibot: la respuesta es una página de desafío ("Just a moment…"). Se detecta y se marca como `blocked`; la UI muestra portal + favicon + título sacado del slug, y permite **completar la vista previa a mano**. No intentar esquivar el antibot.
- La vista previa obtenida se guarda dentro de la casa (y viaja en el respaldo), así que se pide una sola vez por link.

## 5. Ubicación de las casas

- Un solo campo: dirección **o** link / coordenadas de Google Maps. Campos de la casa: `address`, `mapsUrl` (solo si el usuario pegó un link), `coordinates` (`{ lat, lng }`) y `locationStatus` (`pending` → se resuelve al abrir la ficha, `found`, `not_found`).
- **Nominatim** (`nominatim.openstreetmap.org`) para dirección ↔ coordenadas. Respetar su política de uso: **máximo 1 consulta por segundo** (hay una cola en `geocoding.js`) y **nada de autocompletar mientras se escribe**; solo se consulta al guardar.
- Links cortos `maps.app.goo.gl`: redirigen sin CORS, así que se abren con Jina. La dirección (`q=`) y el pin (`!3d…!4d…`) salen de `data.external.preload`, que es un detalle interno de Jina y puede cambiar: si deja de funcionar, cae al centro del `og:image` y a la búsqueda inversa.
- Resolver una ubicación nunca pisa una dirección que escribió el usuario, y se descarta el resultado si la ubicación cambió mientras se buscaba (`applyLocationResult`).
- El mini mapa es el embed de OpenStreetMap: mantener visible la atribución "© OpenStreetMap" (requisito de su licencia).
