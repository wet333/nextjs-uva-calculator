# Simulador UVA Hipotecarios

Calculadora web de créditos hipotecarios UVA en Argentina: condiciones por banco, cotización MEP y valor UVA del día, resultados en UVA / USD / ARS.

## Documentación

| Documento                                        | Para qué sirve                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------- |
| [docs/GUIA-DEL-SITIO.md](docs/GUIA-DEL-SITIO.md) | Guía completa en español: flujo, cálculos, estructura de carpetas, convenciones |

## Inicio rápido

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Agregar condiciones de un banco

Editá `src/data/bank-presets.json`. Cada entrada es un objeto con esta forma:

```json
{
    "name": "Banco Ejemplo",
    "loan_term_years": 20,
    "loan_amount_ars": 300000000,
    "financing_percentage": 75,
    "income_to_loan_ratio": 25,
    "interest_rate_with_salary": 4.5,
    "interest_rate_without_salary": 11.5,
    "minimum_income": 1000000,
    "income_with_spouse": "Cónyuge o conviviente",
    "pre_cancellation": "No aclara",
    "insurance_premium": "1er y 2da Vivienda",
    "for_self_employed": true
}
```

| Campo                          | Tipo            | Descripción                        |
| ------------------------------ | --------------- | ---------------------------------- |
| `name`                         | string          | Nombre visible en el selector      |
| `loan_term_years`              | number          | Plazo máximo en años               |
| `loan_amount_ars`              | number \| null  | Tope del préstamo en ARS           |
| `financing_percentage`         | number          | % máximo financiado                |
| `income_to_loan_ratio`         | number \| null  | % máximo cuota sobre ingresos      |
| `interest_rate_with_salary`    | number          | TNA con cuenta sueldo              |
| `interest_rate_without_salary` | number \| null  | TNA sin cuenta sueldo              |
| `minimum_income`               | number \| null  | Ingreso mínimo en ARS              |
| `income_with_spouse`           | string          | Texto informativo (no calcula aún) |
| `pre_cancellation`             | string          | Texto informativo                  |
| `insurance_premium`            | string          | Texto informativo                  |
| `for_self_employed`            | boolean \| null | Texto informativo                  |

Si un banco tiene variantes (sucursal, segmento), agregá **otra entrada** con otro `name`.

Más contexto en [docs/GUIA-DEL-SITIO.md](docs/GUIA-DEL-SITIO.md).

## Scripts

```bash
npm run dev      # desarrollo (Turbopack)
npm run build    # build de producción
npm run start    # servidor de producción
npm run lint
```

## Licencia

MIT.
