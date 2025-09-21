# UVA Mortgage Calculator 🏠

A Next.js web application for calculating UVA (Unidad de Valor Adquisitivo) mortgage loans in Argentina. This calculator helps users estimate monthly payments, required savings, and other financial metrics for home loans using official conditions from various Argentine banks.

## 🚀 Features

- Calculate mortgage payments in ARS, USD, and UVA
- Pre-configured bank presets with official loan conditions
- Real-time dollar price fetching (MEP rate)

## 🏦 Contributing Bank Information

### Adding New Bank Presets

To add a new bank's mortgage conditions to the calculator, you need to modify the `src/data/mortgageData.json` file.

#### JSON Structure

Each bank preset should be an object with the following properties:

```json
{
  "name": "Bank Name",
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

#### Field Descriptions

| Field                          | Type    | Description                                                                             | Example                                                |
| ------------------------------ | ------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `name`                         | string  | The official name of the bank, including any specific plan or branch                    | "Banco Ciudad - Microcentro"                           |
| `loan_term_years`              | number  | Maximum loan term in years                                                              | 20                                                     |
| `loan_amount_ars`              | number  | Maximum loan amount in Argentine Pesos (ARS), or `null` if not specified                | 250000000                                              |
| `financing_percentage`         | number  | Maximum percentage of property value that can be financed                               | 75                                                     |
| `income_to_loan_ratio`         | number  | Maximum percentage of income that can be used for loan payments, or `null`              | 25                                                     |
| `interest_rate_with_salary`    | number  | Annual interest rate (TNA - Tasa Nominal Anual) for salary account holders              | 4.5                                                    |
| `interest_rate_without_salary` | number  | Annual interest rate for non-salary account holders, or `null` if not applicable        | 11.5                                                   |
| `minimum_income`               | number  | Minimum required monthly income in ARS, or `null` if not specified                      | 1000000                                                |
| `income_with_spouse`           | string  | Types of co-applicant income accepted (e.g., spouse, partner, family)                   | "Cónyuge o conviviente"                                |
| `pre_cancellation`             | string  | Pre-cancellation fee details, or "No aclara" if not specified                           | "3 + IVA (solo si cumplió el 25 del plazo o 180 días)" |
| `insurance_premium`            | string  | Types of properties eligible for the loan (e.g., primary/secondary housing)             | "1er y 2da Vivienda"                                   |
| `for_self_employed`            | boolean | Whether the loan is available for self-employed individuals, or `null` if not specified | true                                                   |

### 🔍 Where to Find Bank Information

- Official bank websites (usually in their "Créditos Hipotecarios" or "Préstamos UVA" sections)

### ⚠️ Important Notes

- Some banks may have different conditions for different customer segments (e.g., "Banco Macro" vs "Banco Macro Selecta")
- Some banks may have special conditions for specific property locations (e.g., "Banco Ciudad - Microcentro")

In those cases just build another entry, with the special case data.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📄 License

This project is open source and available under the MIT License.

## 👥 Contributors

Contributions are welcome! Please read the guidelines above before submitting new bank information.
