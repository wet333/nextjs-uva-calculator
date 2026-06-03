"use client";

import Image from "next/image";
import { LiveRatesBar } from "@/components/layout/LiveRatesBar";
import { useRates } from "@/components/providers/RatesProvider";

export function Header() {
    const { dollarPrice, uvaPrice, ratesMeta, loading, error } = useRates();

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-[1200px] px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div className="min-w-0">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/icon-website.png"
                                alt=""
                                width={40}
                                height={40}
                                className="h-9 w-9 shrink-0 rounded-lg sm:h-10 sm:w-10"
                                priority
                            />
                            <div className="min-w-0">
                                <h1 className="text-balance text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                    Simulador de Préstamos Hipotecarios UVA
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Argentina — estimaciones con datos publicados por entidades
                                    financieras
                                </p>
                            </div>
                        </div>
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
}
