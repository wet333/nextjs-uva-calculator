"use client";

import LiveRatesBar from "@/components/components/LiveRatesBar";
import { useRates } from "@/contexts/RatesContext";

const Header = () => {
    const { dollarPrice, uvaPrice, ratesMeta, loading, error } = useRates();

    return (
        <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto max-w-[1200px] px-4 py-3.5 sm:px-6 sm:py-4 lg:px-8">
                <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <h1 className="text-balance text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                            Simulador de Préstamos Hipotecarios UVA
                        </h1>
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                            Condiciones oficiales de bancos argentinos
                        </p>
                    </div>
                    <LiveRatesBar
                        dollarPrice={dollarPrice}
                        uvaPrice={uvaPrice}
                        ratesMeta={ratesMeta}
                        loading={loading}
                        error={error}
                    />
                </div>
            </div>
        </header>
    );
};

export { Header };
