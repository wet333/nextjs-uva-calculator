# Guía de HomeHunt

Documentación para entender qué hace el sitio, cómo está armado y dónde tocar cada cosa. Mezcla lenguaje coloquial (para retomar el proyecto después de un tiempo) con detalle técnico (para quien contribuye código).

---

## En pocas palabras

**HomeHunt** es una herramienta de ayuda para quien quiere comprar una casa en Argentina. Antes se llamaba _Simulador UVA Hipotecarios_ y solo tenía la calculadora; hoy tiene dos pestañas:

- **Simulador UVA** (`/`): cuánto te prestaría cada banco con tu sueldo y tus ahorros.
- **Mis casas** (`/casas`): seguimiento de las propiedades que te interesan (ver [Mis casas](#mis-casas-seguimiento-de-propiedades)).

En el **Simulador UVA**, el usuario:

1. Ve en el encabezado el **dólar MEP** y el **valor UVA** del día (se cargan solos al abrir la página).
2. En **Tu escenario** carga sueldo, ahorros, plazo y si acredita haberes (una sola fila en desktop).
3. Elige **¿Qué querés averiguar?**:
    - **¿Hasta cuánto puedo comprar?** (`savingsMode = "expand"`): ahorros + préstamo máximo de cada banco = precio de la casa.
    - **¿Me alcanza para una casa puntual?** (`savingsMode = "reduce"`): aparece el campo _Precio de la casa_; precio − ahorros = préstamo a pedir, y se ve qué bancos lo financian.
    - Debajo, una línea explica el cálculo con los números que cargó el usuario.
4. Aprieta **Comparar bancos** y ve **el resultado**: el título repite su pregunta, una línea la responde (mejor banco y cuántos califican) y un **selector de bancos** (agrupado en califican / no califican; cada opción con TNA, plazo, la cifra clave —"casa hasta US$ X" o "cuota $ X"— y la diferencia con la mejor) muestra el detalle del elegido. Se puede usar con teclado y buscar tipeando el nombre (sin "Banco"). Los **adelantos de cuotas** se configuran en ese detalle.
5. Desde ahí, cambiar cualquier dato del escenario actualiza el resultado al instante; **Editar escenario** vuelve al formulario.

No hay backend propio: todo corre en el navegador, con APIs públicas para las cotizaciones y las vistas previas de links, un archivo JSON con datos de bancos y `localStorage` para lo que carga el usuario. Las reglas de esto están en [NOTAS-PARA-CLAUDE.md](NOTAS-PARA-CLAUDE.md).

---

## Flujo del Simulador UVA (usuario)

```
Abre la página
    → RatesProvider pide MEP + UVA
    → Header muestra cotizaciones (o error)

Elige banco (opcional)
    → Se autocompletan tasa, plazo, % financiado, cuota/sueldo
    → Puede limitar monto máximo de propiedad (si el banco lo define en ARS)

Completa valor propiedad (USD) y el resto
    → Validación con react-hook-form

Calcular
    → Si las cotizaciones no están listas: mensaje de error
    → Si todo OK: cuota francesa en USD → pasa a ARS → se expresa en UVA
    → Scroll suave al resultado (después, los cambios del escenario se aplican en vivo)
```

---

## Las cinco filas de resultados

| Concepto               | Qué significa en la vida real                                |
| ---------------------- | ------------------------------------------------------------ |
| **Valor de Cuota**     | Cuota mensual estimada del préstamo                          |
| **Ahorros Necesarios** | Lo que no financia el banco (entrada / ahorro previo)        |
| **Monto a Recibir**    | Capital del préstamo (lo que te prestarían)                  |
| **Total a Pagar**      | Suma de todas las cuotas del plazo                           |
| **Sueldo Requerido**   | Ingreso mínimo para que la cuota no supere el % cuota/sueldo |

Todos se calculan primero en pesos o dólares según el caso, se convierten a **UVA** (unidad de referencia del crédito) y la tabla muestra también USD y ARS usando las cotizaciones cargadas.

---

## Cómo funciona el cálculo (técnico)

### 1. Monto del préstamo (USD)

```
loanAmountUsd = propertyValue × (financialPercentage / 100)
```

El valor de la propiedad se ingresa en **USD**. El porcentaje financiado es el que define cuánto pide prestado.

### 2. Cuota mensual — sistema francés

En `src/lib/mortgage/calculate-payments.js`:

- Tasa mensual: `annualRate / 12 / 100`
- Cantidad de cuotas: `loanDurationYears × 12`
- Fórmula de cuota constante en USD, luego se multiplica por `getDollarPrice()` para expresar cuota y total en **ARS**.

La lógica es la misma que antes del refactor; solo vive en un módulo aparte.

### 3. Resultados en UVA

`build-simulation-results.js` arma el array de 5 ítems usando `arsToUva` y `usdToUva` de `currency-conversions.js`, que leen precios desde `currencies.js`.

### 4. Cotizaciones

`src/lib/currencies.js`:

| Dato              | API                                                                     | Uso       |
| ----------------- | ----------------------------------------------------------------------- | --------- |
| Dólar MEP (venta) | `https://dolarapi.com/v1/dolares/bolsa`                                 | USD ↔ ARS |
| Valor UVA         | `https://api.argentinadatos.com/v1/finanzas/indices/uva` (último punto) | UVA ↔ ARS |

Los precios se guardan en variables del módulo después de `fetchRates()`. `RatesProvider` llama a eso al montar la app y expone `loading`, `error`, `ready`, precios y fechas de referencia al Header y al formulario.

**Importante**: si calculás antes de que `ready` sea true, el formulario muestra el mensaje de cotizaciones no disponibles (comportamiento intencional).

---

## Mis casas (seguimiento de propiedades)

Una ficha por cada casa que encontrás en Zonaprop, Argenprop, Mercado Libre, una inmobiliaria, etc.

| Sección                 | Qué hace                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Ubicación**           | Un solo campo: escribís la dirección o pegás el link de Google Maps, y lo otro se completa solo. Muestra un mini mapa con el pin.                                    |
| **Publicaciones**       | Lista de links con vista previa tipo Discord (imagen, título, descripción). Si el sitio la bloquea, se completa a mano.                                              |
| **Precio y superficie** | Precio publicado y oferta (USD o ARS), cada uno con su total + 15% de honorarios. Debajo, m² de terreno y cubiertos con el valor por m² (publicado y con tu oferta). |
| **Notas**               | Una nota por fila, con fecha. Se pueden editar y borrar. Los pros y contras de versiones anteriores se pasaron acá con el prefijo "Pro:" / "Contra:".                |

En listas: **Enter** agrega y **Shift+Enter** hace salto de línea (en celular, Enter es salto de línea y se agrega con el botón). Borrar pide una confirmación en el lugar.

### Ubicación

El campo acepta cualquiera de estas opciones:

| Escribís / pegás                                               | Qué pasa                                                                                                                   |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Una dirección (`Payró 1349, Tandil`)                           | Se busca en [Nominatim](https://nominatim.org/) (OpenStreetMap) para ubicarla. Google Maps se abre buscando esa dirección. |
| Un link largo de Google Maps (`google.com/maps/place/…`)       | La dirección y el pin salen del propio link, sin consultar nada.                                                           |
| Un link corto de **Compartir** (`maps.app.goo.gl/…`)           | Se abre con Jina Reader, que devuelve la dirección y el pin que tiene guardados Google.                                    |
| Coordenadas (`-37.3265, -59.1365`, clic derecho sobre el mapa) | Se busca la dirección con Nominatim (búsqueda inversa).                                                                    |

- Pegar un link lo guarda al instante; una dirección se guarda con **Enter** o **Guardar**.
- Si escribís una dirección, **nunca se reemplaza** por la que devuelva el servicio.
- El mini mapa es el embed público de OpenStreetMap. No se puede arrastrar: tocarlo abre Google Maps. Si la casa no se pudo ubicar, no hay mapa y en su lugar aparece un ícono ↗ al lado de la dirección.
- Si no se pudo ubicar, aparece **Reintentar**. Las casas guardadas antes de esta versión se ubican solas la primera vez que las abrís.
- Lógica: `src/lib/houses/maps-location.js` (leer links) y `src/lib/houses/geocoding.js` (Nominatim + Jina).

### Dónde se guarda

- En `localStorage` del navegador, clave `uva-calculator:houses` (el prefijo es del nombre anterior y no se cambia para no perder lo guardado). Se sincroniza entre pestañas.
- **Exportar** descarga `homehunt-casas-AAAA-MM-DD.json`; **Importar** lo vuelve a cargar. Importar une por id: si la casa ya existe, gana la versión modificada más recientemente.
- La pantalla avisa si nunca exportaste o si hay cambios sin respaldar.

### Vista previa de links

Se pide a [Jina Reader](https://jina.ai/reader/) (`r.jina.ai`), que abre la página y devuelve sus meta tags `og:*`. Es gratis (~20 consultas por minuto) y funciona con CORS desde el navegador.

Zonaprop y Argenprop tienen antibot en las fichas: ahí la vista previa automática falla y se muestra el portal, el favicon y un título armado con el slug del link. Con **Completar a mano** cargás título, descripción y la URL de la foto (clic derecho sobre la foto → «Copiar dirección de imagen»).

### Honorarios

El 15% es un redondeo fijo en `PURCHASE_FEES_RATE` (`src/constants/houses.js`). Si cambia, se cambia ahí.

---

## Estructura del proyecto (dónde está cada cosa)

```
src/app/
  layout.js     → HTML, providers, Header, main, Footer
  page.js       → Estado: preset elegido, resultados, error de submit
  casas/layout.js     → metadata + HousesProvider
  casas/page.js       → Mis casas: alta, respaldo, grilla de casas
  casas/[id]/page.js  → Ficha de una casa

src/components/houses/
  HouseDetail.jsx       → Arma la ficha (identidad, precio y superficie, links, notas)
  PriceSection.jsx      → Precio publicado / oferta + 15% honorarios
  LinksSection.jsx, LinkPreviewCard.jsx → Links y su vista previa
  EntryList.jsx         → Lista de notas
  HousesBackupBar.jsx   → Exportar / importar y estado del respaldo
  HouseIdentity.jsx     → Nombre y campo único de ubicación
  LocationMap.jsx       → Mini mapa (embed de OpenStreetMap)
  HouseCard.jsx, NewHouseForm.jsx

src/lib/houses/
  house-model.js      → Forma de los datos, normalización, helpers puros
  houses-storage.js   → localStorage, archivo de respaldo, merge al importar
  link-preview.js     → Consulta a Jina Reader
  listing-url.js      → Validar URLs, portal, favicon, título desde el slug
  maps-location.js    → Leer dirección y coordenadas de links de Google Maps
  geocoding.js        → Nominatim (dirección ↔ coordenadas) y links cortos vía Jina
  purchase-cost.js    → Precio + honorarios

src/components/calculator/
  SimulationForm.jsx    → Todo el formulario y validaciones
  SimulationResults.jsx   → Card de resultado: pregunta, respuesta, resumen del escenario
  BankPicker.jsx          → Selector de bancos (Radix Select, patrón combobox WAI-ARIA): monograma, TNA, plazo,
                            cifra clave y diferencia con la mejor opción
  BankDetailPanel.jsx     → Detalle del banco elegido
  ResultsPanel.jsx        → Tabla UVA / USD / ARS

src/components/layout/
  Header.jsx, Footer.jsx, LiveRatesBar.jsx
  SiteTabs.jsx  → Pestañas Simulador UVA / Mis casas

src/components/forms/
  InputWithIcon.jsx, FormattedNumberInput.jsx
  SimulationGoalPicker.jsx → "¿Qué querés averiguar?" (uso de los ahorros)
  ExtraInstallmentsSlider.jsx → Adelantos (solo en el detalle del banco)

src/components/providers/
  RatesProvider.jsx, ThemeProvider.jsx
  HousesProvider.jsx → Estado de Mis casas (useHouses)

src/components/ui/
  → Botones, cards, inputs shadcn (no tocar salvo diseño global)

src/data/bank-presets.json
  → Lista de bancos y condiciones (ver README para campos)

src/lib/mortgage/
  bank-presets.js           → Leer, buscar y ordenar presets
  calculate-payments.js     → Cuota francesa
  build-simulation-results.js → Las 5 métricas

src/constants/mortgage-form.js
  → Mensajes de error y valores default del form
```

### Convenciones de nombres

| Tipo              | Convención                                 | Ejemplo                                                 |
| ----------------- | ------------------------------------------ | ------------------------------------------------------- |
| Componentes React | PascalCase, named export                   | `SimulationForm.jsx` → `export function SimulationForm` |
| Hooks / providers | PascalCase + prefijo use o sufijo Provider | `useRates`, `RatesProvider`                             |
| Módulos de lógica | kebab-case                                 | `currency-conversions.js`                               |
| Datos estáticos   | kebab-case                                 | `bank-presets.json`                                     |
| Constantes        | SCREAMING_SNAKE en archivo dedicado        | `MORTGAGE_FIELD_ERRORS`                                 |

Evitamos carpetas anidadas tipo `components/components/` o nombres genéricos `blocks/`.

---

## Agregar o editar un banco

1. Abrí `src/data/bank-presets.json`.
2. Copiá un objeto existente y ajustá campos (ver tabla en `README.md`).
3. El select del formulario ordena bancos por `interest_rate_with_salary` ascendente.
4. Al elegir un banco:
    - Se hace `reset` del form con sus valores.
    - Tasa y cuota/sueldo pueden quedar **deshabilitados** si el preset los fija.
    - Plazo: opciones cada 5 años hasta `loan_term_years` del banco.
    - Propiedad: si hay `loan_amount_ars`, el máximo en USD se calcula con `arsToUsd(loan_amount_ars)`.

No hace falta tocar código salvo que quieras nueva lógica de restricción.

---

## Ícono del sitio

El logo es una casa que hace de lente de una lupa: la casa en blanco ("Home") y el mango en el azul de la marca ("Hunt"), sobre una tarjeta azul marino.

| Archivo                    | Para qué                                                     |
| -------------------------- | ------------------------------------------------------------ |
| `src/app/icon.svg`         | **Original** (vectorial). Next.js lo publica como favicon.   |
| `src/app/favicon.ico`      | 16, 32 y 48 px para navegadores viejos.                      |
| `src/app/apple-icon.png`   | 180 px **sin esquinas redondeadas** (iOS las redondea solo). |
| `public/homehunt-icon.png` | 512 px para el header.                                       |

Si cambiás `icon.svg`, regenerá los otros tres a partir de él (exportando desde un editor de SVG, o con Inkscape/ImageMagick) y verificá cómo se ve a 16 px en una pestaña.

---

## Stack y comandos

- **Next.js 15** (App Router), **React 19**, **Tailwind**, **react-hook-form**
- **Radix** + componentes en `ui/` (patrón shadcn)

```bash
npm install
npm run dev    # desarrollo
npm run build  # producción
npm run lint
```

Alias de imports: `@/` → `src/` (ver `jsconfig.json`).

---

## Temas que suelen confundir

### ¿Por qué la propiedad está en USD y el tope del banco en ARS?

Los bancos publican montos máximos en pesos. El simulador pide la propiedad en dólares (referencia habitual) y convierte el tope ARS → USD con el MEP del momento para validar el máximo.

### ¿Por qué hay precios en el módulo `currencies.js` y también en React Context?

El módulo es la **fuente de verdad** para las funciones de conversión (se llaman fuera de componentes). El Context **re-renderiza** la UI cuando terminan de cargar y comparte loading/error al Header y al botón Calcular.

### ¿El tema oscuro se puede cambiar?

`layout.js` fuerza `dark` con `next-themes` (`forcedTheme="dark"`). Cambiar eso es decisión de producto, no un bug.

### Archivo `ARCHITECTURE_*.md` en la raíz

Registro del refactor (antes/después, trade-offs). Esta guía es la referencia viva para el día a día; el ARCHITECTURE es el changelog estructural.

---

## Checklist para un cambio seguro

- [ ] ¿Tocás cálculos? → `lib/mortgage/` y probá con mismos inputs que antes.
- [ ] ¿Tocás cotizaciones? → `lib/currencies.js` y `RatesProvider`.
- [ ] ¿Tocás UI del form? → `SimulationForm.jsx`.
- [ ] ¿Tocás tabla de salida? → `ResultsPanel.jsx` / `build-simulation-results.js`.
- [ ] ¿Solo datos de banco? → `bank-presets.json`.
- [ ] ¿Agregás datos que el usuario guarda? → localStorage **y** que viajen en exportar/importar (ver [NOTAS-PARA-CLAUDE.md](NOTAS-PARA-CLAUDE.md)).
- [ ] ¿Cambiás la forma de una casa? → subí `HOUSES_STORE_VERSION` y probá importar un respaldo viejo.
- [ ] Corré `npm run build` antes de subir.

---

## Referencias externas

- [dolarapi](https://dolarapi.com) — dólar bolsa (MEP)
- [argentinadatos UVA](https://api.argentinadatos.com/v1/finanzas/indices/uva) — serie UVA
- [Jina Reader](https://jina.ai/reader/) — vistas previas de links y links cortos de Google Maps en Mis casas
- [Nominatim](https://nominatim.org/) (OpenStreetMap) — dirección ↔ coordenadas de las casas
- [OpenStreetMap embed](https://www.openstreetmap.org/) — mini mapa de cada casa
- Condiciones de cada banco: sitios oficiales (se cargan manualmente al JSON)

---

## Documentos relacionados

- `README.md` — instalación y esquema del JSON de bancos (en inglés, orientado a contribuciones de datos)
- `docs/NOTAS-PARA-CLAUDE.md` — reglas del proyecto (solo frontend, localStorage + exportar/importar); `CLAUDE.md` en la raíz la carga automáticamente en Claude Code
- `ARCHITECTURE_20250603_0230.md` — registro del refactor de organización
