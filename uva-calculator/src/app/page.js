'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Percent, DollarSign, CalendarClock, Scale } from 'lucide-react';
import InputWithIcon from '@/components/components/InputWithIcon';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import CurrenciesCard from '@/components/components/CurrenciesCard';
import { useForm } from 'react-hook-form';
import { fetchDollarPrice, getDollarPrice } from '@/lib/currencies';
import {
	arsToUsd,
	arsToUva,
	usdToArs,
	usdToUva,
} from '@/lib/currencyConvertions';
import bankPresets from './../data/mortageData.json';

export default function Home() {
	const [results, setResults] = useState(null);
	const [selectedPreset, setSelectedPreset] = useState(bankPresets);
	const [dollarPrice, setDollarPrice] = useState(null);
  const { register, handleSubmit, formState, reset } = useForm();

  // Sort Banks by interest_rate_with_salary from lower to highest
  const sortedBankPresets = useMemo(() => {
    return [...bankPresets].sort((a, b) => {
      // Push undefined values to the bottom
      const rateA = a.interest_rate_with_salary ?? Infinity;
      const rateB = b.interest_rate_with_salary ?? Infinity;
      return rateA - rateB;
    });
  }, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				await fetchDollarPrice();
				const price = getDollarPrice();
				setDollarPrice(price);
			} catch (error) {
				console.error('Error fetching dollar price:', error);
				setDollarPrice(null);
			}
		};
		fetchData();
	}, []);

  useEffect(() => {
    if (selectedPreset) {
      reset({
        propertyValue: '',
        financialPercentage: selectedPreset.financing_percentage || '',
        mortgageDuration: selectedPreset.loan_term_years || '',
        interestRate: selectedPreset.interest_rate_with_salary || '',
        salaryPaymentRatio: selectedPreset.income_to_loan_ratio || '',
      });
    } else {
      reset({
        propertyValue: '',
        financialPercentage: '',
        mortgageDuration: '',
        interestRate: '',
        salaryPaymentRatio: '',
      });
    }
  }, [selectedPreset, reset]);

	// Form handling
	const onSubmit = values => {

		if (!dollarPrice) {
			alert('Precio del Dolar no disponible. Intente mas tarde.');
			return;
		}

		const loanAmount = (values.propertyValue * values.financialPercentage) / 100;

		const paymentCalculations = calculatePaymentsARS(
			parseFloat(values.interestRate),
			loanAmount,
			parseInt(values.mortgageDuration)
		);

		const calculateRequiredSavingsUSD = values => {
			return values.propertyValue * ((100 - values.financialPercentage) / 100);
		};

		const calculateLoanAmount = values => {
			return values.propertyValue * (values.financialPercentage / 100);
		};

		const calculateMinimumSalary = (payment, ratio) => {
			return payment / (ratio / 100);
		};

		setResults([
			{
				title: 'Valor de Cuota',
				arsPrice: paymentCalculations.monthlyPayment,
				usdPrice: arsToUsd(paymentCalculations.monthlyPayment),
				uvaPrice: arsToUva(paymentCalculations.monthlyPayment),
			},
			{
				title: 'Ahorros Necesarios',
				arsPrice: usdToArs(calculateRequiredSavingsUSD(values)),
				usdPrice: calculateRequiredSavingsUSD(values),
				uvaPrice: usdToUva(calculateRequiredSavingsUSD(values)),
			},
			{
				title: 'Monto a Recibir',
				arsPrice: usdToArs(calculateLoanAmount(values)),
				usdPrice: calculateLoanAmount(values),
				uvaPrice: usdToUva(calculateLoanAmount(values)),
			},
			{
				title: 'Total a Pagar',
				arsPrice: paymentCalculations.totalToPay,
				usdPrice: arsToUsd(paymentCalculations.totalToPay),
				uvaPrice: arsToUva(paymentCalculations.totalToPay),
			},
			{
				title: 'Sueldo Requerido',
				arsPrice: calculateMinimumSalary(
					paymentCalculations.monthlyPayment,
					values.salaryPaymentRatio
				),
			},
		]);
	};

	function calculatePaymentsARS(annualRate, loanAmount, loanDurationYears) {
		const monthlyRate = annualRate / 12 / 100;
		const totalPayments = loanDurationYears * 12;
		const dollarPrice = getDollarPrice();

		const monthlyPayment =
			(loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
			(Math.pow(1 + monthlyRate, totalPayments) - 1);

		const totalToPay = monthlyPayment * totalPayments;

		return {
			monthlyPayment: monthlyPayment * dollarPrice,
			totalToPay: totalToPay * dollarPrice,
		};
	}

	return (
		<div className="max-w-[1200px] mx-auto mt-6">
			<Card className="bg-slate-800 p-4">
				<CardHeader className="mb-2">
					<CardTitle tag="h2" className="text-2xl font-semibold text-slate-200">
						Calculadora
					</CardTitle>
					<CardTitle tag="p" className="text-md font-light text-slate-400">
						Rellena los datos y haz click en &#34;Calcular&#34; para ver los
						resultados
					</CardTitle>
				</CardHeader>
				<Separator className={'mb-6'} />
				<CardContent>
					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="grid grid-cols-1 gap-8">
							<div>
								<label
									htmlFor="presetSelect"
									className="flex px-1 mb-3 font-bold text-sm text-slate-300"
								>
									Seleccioná un Banco:
								</label>
								<select
									id="presetSelect"
									value={selectedPreset?.name || ''}
									onChange={e => {
										const presetName = e.target.value;
										const preset = bankPresets.find(p => p.name === presetName);
										setSelectedPreset(preset);
										if (preset) {
											reset(preset);
										}
									}}
									className="mt-2 max-h-[40px] text-sm center block w-full bg-slate-900 border border-slate-800 text-gray-300 py-2 px-3 rounded-md"
								>
                  {/* Select options loaded from data file, and ordered by interest rate */}
									<option value="">-- Sin Restricciones --</option>
									{sortedBankPresets.map((preset, index) => (
                    <option key={index} value={preset.name}>
                      {preset.name}
                    </option>
                  ))}
								</select>
							</div>
							<div className="grid grid-cols-2 gap-8">
								<InputWithIcon
									labelText={'Valor de la Propiedad (USD):'}
									htmlFor={'propertyValue'}
									icon={DollarSign}
								>
									<Input
										{...register('propertyValue', {
											required: true,
										})}
										type="number"
										id="propertyValue"
										placeholder="Ingrese el valor de la propiedad (USD)"
										min="0"
										max={
                      selectedPreset?.loan_amount_ars ? arsToUsd(selectedPreset.loan_amount_ars) : 999999999
                    }
										step="1000"
									/>
								</InputWithIcon>
								<InputWithIcon
									labelText={'Porcentaje Financiado:'}
									htmlFor={'financialPercentage'}
									icon={Percent}
								>
									<Input
										{...register('financialPercentage', {
											required: true,
										})}
										id={'financialPercentage'}
										type="number"
										placeholder="Ingrese el porcentaje de financiacion"
										min="0"
										max={
											selectedPreset?.financing_percentage
												? selectedPreset.financing_percentage
												: 100
										}
										step="1"
									/>
								</InputWithIcon>
							</div>
							<div className="grid grid-cols-2 gap-8">
								<InputWithIcon
									labelText={'Plazo del Préstamo:'}
									htmlFor={'mortgageDuration'}
									icon={CalendarClock}
								>
									<Input
										{...register('mortgageDuration', {
											required: true,
										})}
										id={'mortgageDuration'}
										type="number"
										placeholder="Ingrese el plazo del prestamo en años"
										min={5}
										max={
											selectedPreset?.loan_term_years
												? selectedPreset.loan_term_years
												: 30
										}
										step="5"
									/>
								</InputWithIcon>
								<InputWithIcon
									labelText={'Tasa de Interes:'}
									htmlFor={'interestRate'}
									icon={Percent}
								>
									<Input
										{...register('interestRate', {
											required: true,
											min: 0,
										})}
										id={'interestRate'}
										type="number"
										placeholder="Ingrese la Tasa de Interes"
										min={selectedPreset?.interest_rate_with_salary ? selectedPreset.interest_rate_with_salary : 0}
										max={
											selectedPreset?.interest_rate_with_salary ? selectedPreset.interest_rate_with_salary : null
										}
										step="0.1"
                    value={selectedPreset?.interest_rate_with_salary}
										disabled={!!selectedPreset?.interest_rate_with_salary}
									/>
								</InputWithIcon>
							</div>
							<div className="grid grid-cols-2 gap-8">
								<InputWithIcon
									labelText={'Relacion Cuota/Sueldo:'}
									htmlFor={'salaryPaymentRatio'}
									icon={Percent}
								>
									<Input
										{...register('salaryPaymentRatio', {
											required: true,
										})}
										id={'salaryPaymentRatio'}
										type="number"
										placeholder="Ingrese el limite del valor de la cuota"
										min={
											selectedPreset?.income_to_loan_ratio
												? selectedPreset.income_to_loan_ratio
												: 25
										}
										max={
											selectedPreset?.income_to_loan_ratio
												? selectedPreset.income_to_loan_ratio
												: 35
										}
										step="5"
                    value={selectedPreset?.income_to_loan_ratio}
										disabled={!!selectedPreset?.income_to_loan_ratio}
									/>
								</InputWithIcon>
							</div>
							<Separator />
							<div className="grid grid-cols-2 gap-8">
								<InputWithIcon
									labelText={'Precio del Dolar (MEP Venta):'}
									htmlFor={'dollarPrice'}
									icon={DollarSign}
									helpMsg={'Precio de Venta del Dolar MEP.'}
								>
									<Input
										id={'dollarPrice'}
										type="number"
										disabled={true}
										value={dollarPrice ?? 'Precio del Dolar no disponible'}
									/>
								</InputWithIcon>
							</div>
							<div>
								<Button type={'submit'} color={'default'}>
									Calcular
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>

			{results != null ? (
				<Card className="bg-slate-800 p-4 mt-12 mb-6">
					<CardHeader className="mb-2">
						<CardTitle tag="h2" className="text-2xl font-semibold text-slate-200">
							Resultados
						</CardTitle>
					</CardHeader>
					<Separator className={'mb-6'} />
					<CardContent>
						<div className="grid grid-cols-2 gap-6">
							{results.map((data, index) => (
								<CurrenciesCard
									key={index}
									title={data.title}
									arsPrice={data.arsPrice}
									usdPrice={data.usdPrice}
									uvaPrice={data.uvaPrice}
								/>
							))}
						</div>
					</CardContent>
				</Card>
			) : (
				''
			)}
		</div>
	);
}
