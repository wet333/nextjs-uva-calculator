"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Percent, DollarSign, CalendarClock} from "lucide-react";
import InputWithIcon from "@/components/components/InputWithIcon";
import {Separator} from "@/components/ui/separator";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import CurrenciesCard from "@/components/components/CurrenciesCard";

export default function Home() {
    const [dollarPrice, setDollarPrice] = useState(0);
    const [uvaPrice, setUvaPrice] = useState(1252.2);
    const [calculationResults, setCalculationResults] = useState({
        monthlyPayment: null,
        totalToPay: null
    });
    const [inputs, setInputs] = useState({
        propertyValue: '',
        financialPercentage: '',
        mortgageDuration: '',
        interestRate: ''
    });

    function calculatePayment(annualRate, loanAmount, loanDurationYears) {
        const monthlyRate = annualRate / 12 / 100;
        const totalPayments = loanDurationYears * 12;

        const monthlyPayment = loanAmount *
            (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
            (Math.pow(1 + monthlyRate, totalPayments) - 1);

        const totalToPay = monthlyPayment * totalPayments;

        return {
            monthlyPayment: monthlyPayment * dollarPrice,
            totalToPay: totalToPay * dollarPrice,
        };
    }

    function formatCurrency(value) {
        if (value == null) return "N/A";
        return `${new Intl.NumberFormat('es-AR', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value)}`;
    }

    useEffect(() => {
        const fetchDollarPrice = async () => {
            try {
                const response = await fetch("https://dolarapi.com/v1/dolares/bolsa");
                if (!response.ok) {
                    throw new Error("Failed to fetch dollar price");
                }
                const data = await response.json();
                setDollarPrice(data.venta);
            } catch (error) {
                console.error("Error fetching dollar price:", error);
            }
        };
        fetchDollarPrice().then(() => console.log("Precio del dolar obtenido gracias a dolarapi"));
    }, []);

    const handleInputChange = (e) => {
        const {id, value} = e.target;
        setInputs((prev) => ({
            ...prev,
            [id]: value
        }));
    };

    const handleCalculate = () => {
        const loanAmount = (inputs.propertyValue * inputs.financialPercentage) / 100;
        const results = calculatePayment(
            parseFloat(inputs.interestRate),
            loanAmount,
            parseInt(inputs.mortgageDuration)
        );
        setCalculationResults(results);
    };

    return (
        <div className="max-w-[1200px] mx-auto mt-6">
            <Card className="bg-slate-800 p-4">
                <CardHeader className="mb-2">
                    <CardTitle tag="h2" className="text-2xl font-semibold text-slate-200">Calculadora</CardTitle>
                    <CardTitle tag="p" className="text-md font-light text-slate-500">
                        Rellena los datos y haz click en &#34;Calcular&#34; para ver los resultados
                    </CardTitle>
                </CardHeader>
                <Separator className={"mb-6"} />
                <CardContent>
                    <form action="">
                        <div className="grid grid-cols-1 gap-8">
                            <div className="grid grid-cols-2 gap-8">
                                <InputWithIcon labelText={"Valor de la Propiedad:"} htmlFor={"propertyValue"} icon={DollarSign}>
                                    <Input
                                        type="number"
                                        id="propertyValue"
                                        placeholder="Ingrese el valor de la propiedad (USD)"
                                        value={inputs.propertyValue}
                                        onChange={handleInputChange}
                                    />
                                </InputWithIcon>
                                <InputWithIcon labelText={"Porcentaje Financiado:"} htmlFor={"financialPercentage"} icon={Percent}>
                                    <Input
                                        id={"financialPercentage"}
                                        type="number"
                                        placeholder="Ingrese el porcentaje de financiacion"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={inputs.financialPercentage}
                                        onChange={handleInputChange}
                                    />
                                </InputWithIcon>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <InputWithIcon labelText={"Plazo del Préstamo:"} htmlFor={"mortgageDuration"} icon={CalendarClock}>
                                    <Input
                                        id={"mortgageDuration"}
                                        type="number"
                                        placeholder="Ingresa el plazo del prestamo en años"
                                        min="5"
                                        max="30"
                                        step="5"
                                        value={inputs.mortgageDuration}
                                        onChange={handleInputChange}
                                    />
                                </InputWithIcon>
                                <InputWithIcon labelText={"Tasa de Interes:"} htmlFor={"interestRate"} icon={Percent}>
                                    <Input
                                        id={"interestRate"}
                                        type="number"
                                        placeholder="Ingresa la Tasa de Interes"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={inputs.interestRate}
                                        onChange={handleInputChange}
                                    />
                                </InputWithIcon>
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <InputWithIcon
                                    labelText={"Precio del Dolar (MEP Venta):"}
                                    htmlFor={"dollar-price"}
                                    icon={DollarSign}
                                    helpMsg={"Precio de Venta del Dolar MEP."}
                                >
                                    <Input
                                        id={"dollar-price"}
                                        type="number"
                                        disabled={true}
                                        value={dollarPrice ?? "Precio del Dolar no disponible"}
                                    />
                                </InputWithIcon>
                            </div>
                            <div>
                                <Button
                                    variant={"default"}
                                    className={"font-semibold"}
                                    onClick={handleCalculate}
                                    type="button"
                                >
                                    Calcular
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {calculationResults.monthlyPayment != null ?
                <Card className="bg-slate-800 p-4 mt-12 mb-6">
                    <CardHeader className="mb-2">
                        <CardTitle tag="h2" className="text-2xl font-semibold text-slate-200">Resultados</CardTitle>
                    </CardHeader>
                    <Separator className={"mb-6"} />
                    <CardContent>
                        <div className="grid grid-cols-2 gap-8">
                            <CurrenciesCard
                                title={"Valor de Cuota"}
                                arsPrice={formatCurrency(calculationResults.monthlyPayment)}
                                usdPrice={formatCurrency(calculationResults.monthlyPayment / dollarPrice)}
                                uvaPrice={formatCurrency(calculationResults.monthlyPayment  / uvaPrice)}
                            />
                            <CurrenciesCard
                                title={"Total Financiado"}
                                arsPrice={formatCurrency((calculationResults.totalToPay * inputs.financialPercentage) / 100)}
                                usdPrice={formatCurrency(((calculationResults.totalToPay * inputs.financialPercentage) / 100) / dollarPrice)}
                                uvaPrice={formatCurrency(((calculationResults.totalToPay * inputs.financialPercentage) / 100) / uvaPrice)}
                            />
                        </div>
                    </CardContent>
                </Card> : ""
            }
        </div>
    );
}
