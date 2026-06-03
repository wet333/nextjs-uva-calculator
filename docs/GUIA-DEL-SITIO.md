# Guía del simulador UVA hipotecarios

Documentación para entender qué hace el sitio, cómo está armado y dónde tocar cada cosa. Mezcla lenguaje coloquial (para retomar el proyecto después de un tiempo) con detalle técnico (para quien contribuye código).

---

## En pocas palabras

El sitio es una **calculadora de préstamos hipotecarios UVA** para Argentina. El usuario:

1. Ve en el encabezado el **dólar MEP** y el **valor UVA** del día (se cargan solos al abrir la página).
2. Completa un formulario: valor de la propiedad en USD, % financiado, plazo, tasa, relación cuota/sueldo.
3. Opcionalmente elige un **banco** de una lista; eso rellena y limita campos según condiciones que vos cargaste en un JSON.
4. Aprieta **Calcular simulación** y ve una tabla con cinco conceptos en **UVA, USD y ARS**.

No hay backend propio: todo corre en el navegador, con dos APIs públicas para las cotizaciones y un archivo JSON con datos de bancos.

---

## Flujo de la experiencia (usuario)

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
    → Scroll suave a la tabla de resultados
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

## Estructura del proyecto (dónde está cada cosa)

```
src/app/
  layout.js     → HTML, providers, Header, main, Footer
  page.js       → Estado: preset elegido, resultados, error de submit

src/components/calculator/
  SimulationForm.jsx    → Todo el formulario y validaciones
  SimulationResults.jsx   → Card de resultados (vacío o tabla)
  ResultsPanel.jsx        → Tabla UVA / USD / ARS

src/components/layout/
  Header.jsx, Footer.jsx, LiveRatesBar.jsx

src/components/forms/
  InputWithIcon.jsx, FormattedNumberInput.jsx

src/components/providers/
  RatesProvider.jsx, ThemeProvider.jsx

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
- [ ] Corré `npm run build` antes de subir.

---

## Referencias externas

- [dolarapi](https://dolarapi.com) — dólar bolsa (MEP)
- [argentinadatos UVA](https://api.argentinadatos.com/v1/finanzas/indices/uva) — serie UVA
- Condiciones de cada banco: sitios oficiales (se cargan manualmente al JSON)

---

## Documentos relacionados

- `README.md` — instalación y esquema del JSON de bancos (en inglés, orientado a contribuciones de datos)
- `ARCHITECTURE_20250603_0230.md` — registro del refactor de organización
