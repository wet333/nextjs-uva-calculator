# Design Document — HomeHunt

> Fuente de verdad de las decisiones visuales. Leelo antes de cambiar el diseño y actualizalo después.

## 1. Brief

- **Qué es:** herramienta de ayuda para comprar casa en Argentina: Simulador UVA (`/`) y Mis casas (`/casas`).
- **Para quién:** personas que buscan su primera casa y comparan bancos y propiedades.
- **Objetivo:** que en segundos se entienda cuánto se puede comprar y si una casa puntual alcanza.
- **Voz:** clara, confiable, cercana.
- **Nivel de originalidad:** 2 — Detailed (estructura convencional, tipografía y espaciado cuidados).

## 2. Tokens de color

Definidos como HSL en `src/app/globals.css` y expuestos en `tailwind.config.js`. Tema oscuro forzado.

| Token              | Hex aprox. | Rol                                                          |
| ------------------ | ---------- | ------------------------------------------------------------ |
| `background`       | #0C0E13    | Fondo de página                                              |
| `card`             | #12151C    | Superficie de tarjetas (`surface-panel`, al 50%)             |
| `foreground`       | #EAEDF0    | Texto principal                                              |
| `muted-foreground` | #768293    | Texto secundario, ayudas, etiquetas                          |
| `primary`          | #417EC8    | Interacción: botones, foco, links, selección                 |
| `cta`              | #3666A1    | Botón principal ("Comparar bancos", "Agregar casa")          |
| `brand`            | #5B9BE8    | Marca: "Hunt" del wordmark y mango del ícono. No usar en UI. |
| `destructive`      | #CA2B2B    | Errores y borrar                                             |

Monedas (`.currency-label`): USD #4ADE80, UVA #FB923C, ARS #38BDF8.

Contraste sobre `background`: foreground ≈ 16:1 ✓ · muted-foreground ≈ 4,9:1 ✓ · brand ≈ 6,7:1 ✓ · primary ≈ 4,6:1 (AA justo: usarlo en texto ≥ 14px medium o en fondos, no en texto chico).

## 3. Tipografía

| Rol     | Familia           | Pesos              | Uso                                               |
| ------- | ----------------- | ------------------ | ------------------------------------------------- |
| Display | Plus Jakarta Sans | 800                | **Solo el wordmark "HomeHunt"**; tracking −0.02em |
| Body    | IBM Plex Sans     | 400, 500, 600, 700 | Todo lo demás; números con `tabular-nums`         |

Se cargan con `next/font/google` en `src/app/layout.js` (`--font-display`, `--font-sans`) y se usan como `font-display` / `font-sans`. Escala: títulos de tarjeta `text-lg font-semibold`, etiquetas `text-sm font-medium`, ayudas `text-xs text-muted-foreground`, detalle `text-[11px]`.

## 4. Espaciado y layout

- Contenedor: `max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8`; secciones separadas con `space-y-6`/`space-y-8`.
- Tarjetas: `surface-panel` (rounded-xl, `bg-card/50`, ring blanco 5%, `shadow-panel`), padding `px-6 sm:px-7`.
- Formularios: grid `gap-y-4 sm:gap-x-6 lg:gap-x-8`; campos `h-10` (en "Tu escenario" `sm:h-9`); etiquetas siempre visibles.
- Radio base `--radius: 0.625rem`. Bordes/anillos: `ring-white/[0.05–0.08]`.
- Mobile-first: base = mobile; `sm` 640, `md` 768, `lg` 1024.

## 5. Elemento distintivo

**Qué:** el lockup de marca: ícono de casa-lupa + wordmark en dos tonos (**Home** blanco, **Hunt** en `brand`).
**Por qué:** "casa" + "búsqueda" en una sola figura; el mismo azul une ícono y nombre.
**Dónde:** header (`public/homehunt-icon.png` + `<h1>`), favicon (`src/app/icon.svg`). Detalle en `GUIA-DEL-SITIO.md` → "Ícono del sitio".

## 6. Motion

Transiciones cortas de color/sombra (150ms). Popovers con fade + zoom 0.98. Guardia global de `prefers-reduced-motion` en `globals.css`.

## 7. Convenciones de componentes

- Átomos estilo shadcn en `components/ui/`; formularios en `components/forms/`; secciones por feature en `components/calculator/` y `components/houses/`; layout en `components/layout/`.
- Widgets complejos con primitivas Radix (select, tooltip, hover-card); controles nativos cuando alcanzan (radios, inputs).
- Selección con explicación: tarjetas de radio con círculo visible y pista breve ("¿Qué querés averiguar?").

## 8. Voz del texto

Español rioplatense con voseo ("Simulá", "Compará"). Sentence case. Decisiones como preguntas del usuario. Botones con verbos concretos ("Comparar bancos", "Agregar casa"). Explicar con los números del propio usuario cuando se pueda.

## 9. Registro de decisiones

| Fecha      | Decisión                                                                                  | Motivo                                                                                                    |
| ---------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| 2024-11-14 | Base visual: tema oscuro, IBM Plex Sans, primario azul                                    | Calculadora UVA sobria y legible                                                                          |
| 2026-09-28 | Rebrand a HomeHunt; pestañas Simulador UVA / Mis casas                                    | El sitio pasó a ser una herramienta de ayuda al comprador                                                 |
| 2026-09-28 | "Tu escenario" compacto; "¿Qué querés averiguar?"; resultados con selector de bancos rico | Menos altura, modos de ahorro comprensibles, escenario y resultado conectados                             |
| 2026-09-29 | Ícono casa-lupa (SVG + ICO + PNG)                                                         | El ícono anterior decía "UVA" y ya no representaba la marca                                               |
| 2026-09-29 | Wordmark en Plus Jakarta Sans 800 y token `brand` (#5B9BE8) para "Hunt"                   | IBM Plex se veía genérica; se compararon 13 fuentes y ganó la más firme a 20px y afín al ícono redondeado |
