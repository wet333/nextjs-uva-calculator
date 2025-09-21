# UVA Mortgage Calculator 🏠

A Next.js web application for calculating UVA (Unidad de Valor Adquisitivo) mortgage loans in Argentina. This calculator helps users estimate monthly payments, required savings, and other financial metrics for home loans using official conditions from various Argentine banks.

## 🚀 Features

- Calculate mortgage payments in ARS, USD, and UVA
- Pre-configured bank presets with official loan conditions
- Real-time dollar price fetching (MEP rate)
- Responsive dark-themed interface
- Support for multiple Argentine banks

## 🏦 Contributing Bank Information

### Adding New Bank Presets

To add a new bank's mortgage conditions to the calculator, you need to modify the `src/data/mortgagePresets.json` file.

#### File Location
```
src/data/mortgagePresets.json
```

#### JSON Structure

Each bank preset should be an object with the following properties:

```json
{
  "name": "Bank Name",
  "maxFinancialPercentage": 75,
  "interestRate": 4.5,
  "minMortgageDuration": 5,
  "maxMortgageDuration": 30,
  "salaryPaymentRatio": 25
}
```

#### Field Descriptions

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | string | The official name of the bank + Financial plan name | "Banco Nación" |
| `maxFinancialPercentage` | number | Maximum percentage of property value that can be financed | 75 (means 75%) |
| `interestRate` | number | Annual interest rate (TNA - Tasa Nominal Anual) | 4.5 (means 4.5%) |
| `minMortgageDuration` | number | Minimum loan term in years | 5 |
| `maxMortgageDuration` | number | Maximum loan term in years | 30 |
| `salaryPaymentRatio` | number | Maximum percentage of salary that can be used for payment | 25 (means 25%) |

#### Example: Adding a New Bank

To add a new bank, append a new object to the existing array in `mortgagePresets.json`:

```json
[
  // ... existing banks ...
  {
    "name": "Banco Example - Payroll Client",
    "maxFinancialPercentage": 80,
    "interestRate": 7.5,
    "minMortgageDuration": 10,
    "maxMortgageDuration": 25,
    "salaryPaymentRatio": 30
  },
  {
    "name": "Banco Example - Non Client",
    "maxFinancialPercentage": 75,
    "interestRate": 12.5,
    "minMortgageDuration": 10,
    "maxMortgageDuration": 25,
    "salaryPaymentRatio": 20
  },
]
```

### 🔍 Where to Find Bank Information

- Official bank websites (usually in their "Créditos Hipotecarios" or "Préstamos UVA" sections)
- Central Bank of Argentina (BCRA) website
- Bank customer service or mortgage departments
- Official bank communications and brochures

### ⚠️ Important Notes

- Some banks may have different conditions for different customer segments (e.g., "Banco Macro" vs "Banco Macro Selecta")
- Some banks may have special conditions for specific property locations (e.g., "Banco Ciudad - Microcentro")

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
