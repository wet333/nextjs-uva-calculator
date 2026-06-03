'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
	Percent,
	DollarSign,
	CalendarClock,
	Loader2,
	BarChart3,
} from 'lucide-react';
import InputWithIcon from '@/components/components/InputWithIcon';
import FormattedNumberInput from '@/components/components/FormattedNumberInput';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useMemo, useRef } from 'react';
import ResultsPanel from '@/components/components/ResultsPanel';
import { useForm, Controller } from 'react-hook-form';
import { getDollarPrice } from '@/lib/currencies';
import { arsToUsd, arsToUva, usdToUva } from '@/lib/currencyConvertions';
import bankPresets from './../data/mortgageData.json';
import { formatThousandsDisplay } from '@/lib/utils';
import { useRates } from '@/contexts/RatesContext';

const COMPACT_FIELD = 'h-9 py-1.5 tabular-nums';

const FIELD_ERRORS = {
	propertyValue: 'Ingresá el valor de la propiedad en USD.',
	financialPercentage: 'Ingresá el porcentaje financiado.',
	mortgageDuration: 'Seleccioná el plazo del préstamo.',
	interestRate: 'Ingresá la tasa de interés.',
	salaryPaymentRatio: 'Ingresá la relación cuota/sueldo.',
};

export default function Home() {
	const [results, setResults] = useState(null);
	const [selectedPreset, setSelectedPreset] = useState(null);
	const [submitError, setSubmitError] = useState(null);
	const { loading: ratesLoading, ready: ratesReady } = useRates();
	const resultsRef = useRef(null);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isSubmitting },
		reset,
		setFocus,
	} = useForm({
		defaultValues: {
			propertyValue: '',
			financialPercentage: '',
			mortgageDuration: '',
			interestRate: '',
			salaryPaymentRatio: '',
		},
	});

	const sortedBankPresets = useMemo(() => {
		return [...bankPresets].sort((a, b) => {
			const rateA = a.interest_rate_with_salary ?? Infinity;
			const rateB = b.interest_rate_with_salary ?? Infinity;
			return rateA - rateB;
		});
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

	const onInvalid = invalidErrors => {
		const firstKey = Object.keys(invalidErrors)[0];
		if (firstKey) {
			setFocus(firstKey);
		}
	};

	const onSubmit = async values => {
		setSubmitError(null);

		if (!ratesReady) {
			setSubmitError(
				'Las cotizaciones del dólar MEP y la UVA no están disponibles. Esperá a que carguen o recargá la página.'
			);
			return;
		}

		await new Promise(resolve => requestAnimationFrame(resolve));

		const loanAmount = (values.propertyValue * values.financialPercentage) / 100;

		const paymentCalculations = calculatePaymentsARS(
			parseFloat(values.interestRate),
			loanAmount,
			parseInt(values.mortgageDuration)
		);

		const calculateRequiredSavingsUSD = vals => {
			return vals.propertyValue * ((100 - vals.financialPercentage) / 100);
		};

		const calculateLoanAmount = vals => {
			return vals.propertyValue * (vals.financialPercentage / 100);
		};

		const calculateMinimumSalary = (payment, ratio) => {
			return payment / (ratio / 100);
		};

		setResults([
			{
				title: 'Valor de Cuota',
				uvaAmount: arsToUva(paymentCalculations.monthlyPayment),
			},
			{
				title: 'Ahorros Necesarios',
				uvaAmount: usdToUva(calculateRequiredSavingsUSD(values)),
			},
			{
				title: 'Monto a Recibir',
				uvaAmount: usdToUva(calculateLoanAmount(values)),
			},
			{
				title: 'Total a Pagar',
				uvaAmount: arsToUva(paymentCalculations.totalToPay),
			},
			{
				title: 'Sueldo Requerido',
				uvaAmount: arsToUva(
					calculateMinimumSalary(
						paymentCalculations.monthlyPayment,
						values.salaryPaymentRatio
					)
				),
			},
		]);

		requestAnimationFrame(() => {
			const prefersReducedMotion = window.matchMedia(
				'(prefers-reduced-motion: reduce)'
			).matches;
			resultsRef.current?.scrollIntoView({
				behavior: prefersReducedMotion ? 'auto' : 'smooth',
				block: 'start',
			});
		});
	};

	function calculatePaymentsARS(annualRate, loanAmount, loanDurationYears) {
		const monthlyRate = annualRate / 12 / 100;
		const totalPayments = loanDurationYears * 12;
		const price = getDollarPrice();

		const monthlyPayment =
			(loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
			(Math.pow(1 + monthlyRate, totalPayments) - 1);

		const totalToPay = monthlyPayment * totalPayments;

		return {
			monthlyPayment: monthlyPayment * price,
			totalToPay: totalToPay * price,
		};
	}

	const maxPropertyValue = selectedPreset?.loan_amount_ars
		? arsToUsd(selectedPreset.loan_amount_ars)
		: 999999999;

	const loanTermOptions = useMemo(() => {
		const max = selectedPreset?.loan_term_years ?? 30;
		const options = [];
		for (let years = 5; years <= max; years += 5) {
			options.push(years);
		}
		return options;
	}, [selectedPreset]);

	return (
		<div className="mx-auto max-w-[1200px] space-y-8">
			<Card>
				<CardHeader className="space-y-1 p-4 pb-2 sm:p-5">
					<CardTitle tag="h2" className="text-balance text-xl sm:text-2xl">
						Calculadora
					</CardTitle>
					<CardDescription>
						Completá los datos y presioná Calcular para ver los resultados
					</CardDescription>
				</CardHeader>
				<Separator className="mb-0" />
				<CardContent className="p-4 pt-3 sm:p-5 sm:pt-4">
					<form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate>
						<div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
							<div className="col-span-full">
								<Label
									htmlFor="presetSelect"
									className="mb-1 flex items-center gap-1 px-0.5 text-xs font-medium text-foreground sm:text-sm"
								>
									Seleccioná un banco
								</Label>
								<Select
									id="presetSelect"
									name="bankPreset"
									autoComplete="off"
									className={COMPACT_FIELD}
									value={selectedPreset?.name || ''}
									onChange={e => {
										const presetName = e.target.value;
										const preset = bankPresets.find(p => p.name === presetName);
										setSelectedPreset(preset ?? null);
									}}
								>
									<option value="">Sin restricciones…</option>
									{sortedBankPresets.map((preset, index) => (
										<option key={index} value={preset.name}>
											{preset.name}
										</option>
									))}
								</Select>
							</div>
							<InputWithIcon
								compact
								labelText="Valor de la Propiedad (USD)"
								htmlFor="propertyValue"
								icon={DollarSign}
								error={errors.propertyValue?.message}
							>
								<Controller
									name="propertyValue"
									control={control}
									rules={{
										required: FIELD_ERRORS.propertyValue,
										min: {
											value: 1,
											message: 'El valor debe ser mayor a 0.',
										},
										max: {
											value: maxPropertyValue,
											message: `El valor no puede superar U$D ${formatThousandsDisplay(maxPropertyValue)}.`,
										},
									}}
									render={({ field }) => (
										<FormattedNumberInput
											id="propertyValue"
											name="propertyValue"
											placeholder="Ej. 150.000…"
											value={field.value}
											onChange={field.onChange}
											onBlur={field.onBlur}
											ref={field.ref}
											max={maxPropertyValue}
											aria-invalid={errors.propertyValue ? true : undefined}
											aria-describedby={
												errors.propertyValue
													? 'propertyValue-error'
													: undefined
											}
											className={
												errors.propertyValue
													? `border-destructive focus-visible:ring-destructive ${COMPACT_FIELD}`
													: COMPACT_FIELD
											}
										/>
									)}
								/>
							</InputWithIcon>
							<InputWithIcon
								compact
								labelText="Porcentaje Financiado"
								htmlFor="financialPercentage"
								icon={Percent}
								error={errors.financialPercentage?.message}
							>
								<Input
									{...register('financialPercentage', {
										required: FIELD_ERRORS.financialPercentage,
										valueAsNumber: true,
									})}
									id="financialPercentage"
									name="financialPercentage"
									type="number"
									placeholder="Ej. 75…"
									inputMode="numeric"
									autoComplete="off"
									className={COMPACT_FIELD}
									min="0"
									max={
										selectedPreset?.financing_percentage
											? selectedPreset.financing_percentage
											: 100
									}
									step="1"
								/>
							</InputWithIcon>
							<InputWithIcon
								compact
								labelText="Plazo del Préstamo"
								htmlFor="mortgageDuration"
								icon={CalendarClock}
								error={errors.mortgageDuration?.message}
							>
								<Select
									{...register('mortgageDuration', {
										required: FIELD_ERRORS.mortgageDuration,
										valueAsNumber: true,
									})}
									id="mortgageDuration"
									name="mortgageDuration"
									autoComplete="off"
									className={
										errors.mortgageDuration
											? `border-destructive focus-visible:ring-destructive ${COMPACT_FIELD}`
											: COMPACT_FIELD
									}
										aria-invalid={errors.mortgageDuration ? true : undefined}
										aria-describedby={
											errors.mortgageDuration
												? 'mortgageDuration-error'
												: undefined
										}
									>
										<option value="">Seleccioná el plazo…</option>
										{loanTermOptions.map(years => (
											<option key={years} value={years}>
												{years} años
											</option>
										))}
									</Select>
							</InputWithIcon>
							<InputWithIcon
								compact
								labelText="Tasa de Interés"
								htmlFor="interestRate"
								icon={Percent}
								error={errors.interestRate?.message}
							>
								<Input
									{...register('interestRate', {
										required: FIELD_ERRORS.interestRate,
										valueAsNumber: true,
										min: {
											value: 0,
											message: 'La tasa no puede ser negativa.',
										},
									})}
									id="interestRate"
									name="interestRate"
									type="number"
									placeholder="Ej. 4.5…"
									inputMode="decimal"
									autoComplete="off"
									className={COMPACT_FIELD}
									min={
										selectedPreset?.interest_rate_with_salary
											? selectedPreset.interest_rate_with_salary
											: 0
									}
									max={
										selectedPreset?.interest_rate_with_salary
											? selectedPreset.interest_rate_with_salary
											: undefined
									}
									step="0.1"
									disabled={!!selectedPreset?.interest_rate_with_salary}
								/>
							</InputWithIcon>
							<InputWithIcon
								compact
								labelText="Relación Cuota/Sueldo"
								htmlFor="salaryPaymentRatio"
								icon={Percent}
								error={errors.salaryPaymentRatio?.message}
							>
								<Input
									{...register('salaryPaymentRatio', {
										required: FIELD_ERRORS.salaryPaymentRatio,
										valueAsNumber: true,
									})}
									id="salaryPaymentRatio"
									name="salaryPaymentRatio"
									type="number"
									placeholder="Ej. 25…"
									inputMode="numeric"
									autoComplete="off"
									className={COMPACT_FIELD}
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
									disabled={!!selectedPreset?.income_to_loan_ratio}
								/>
							</InputWithIcon>

							<div
								className="col-span-full flex flex-col gap-3 border-t border-border/40 pt-3 sm:flex-row sm:items-center sm:justify-between"
								aria-live="polite"
								aria-atomic="true"
							>
								{submitError ? (
									<p
										role="alert"
										className="flex-1 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
									>
										{submitError}
									</p>
								) : (
									<span className="sr-only">Sin errores de envío</span>
								)}
								<Button
									type="submit"
									variant="cta"
									size="sm"
									className="h-9 w-full shrink-0 sm:w-auto sm:min-w-[140px]"
									disabled={isSubmitting || ratesLoading}
									aria-busy={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2
												className="animate-spin"
												aria-hidden="true"
											/>
											Calculando…
										</>
									) : (
										'Calcular'
									)}
								</Button>
							</div>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card ref={resultsRef} className="scroll-mt-[5.5rem]">
				<CardHeader className="space-y-1 p-4 pb-2 sm:p-5">
					<CardTitle tag="h2" className="text-balance text-xl sm:text-2xl">
						Resultados
					</CardTitle>
					<CardDescription>
						Montos en UVA, USD y ARS al tipo de cambio de hoy.
					</CardDescription>
				</CardHeader>
				<Separator className="mb-0" />
				<CardContent className="p-4 pt-3 sm:p-5 sm:pt-4">
					{results != null ? (
						<ResultsPanel results={results} />
					) : (
						<div className="flex flex-col items-center justify-center gap-3 py-12 text-center sm:py-14">
							<div
								className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/80 text-muted-foreground sm:h-14 sm:w-14"
								aria-hidden="true"
							>
								<BarChart3 className="h-6 w-6 sm:h-7 sm:w-7" />
							</div>
							<p className="max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
								Completá el formulario y presioná Calcular. Los montos en
								UVAs aparecerán aquí.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
