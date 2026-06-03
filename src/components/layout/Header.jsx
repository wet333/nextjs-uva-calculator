"use client";

import Image from "next/image";
import { LiveRatesBar } from "@/components/layout/LiveRatesBar";
import { useRates } from "@/components/providers/RatesProvider";

export function Header() {
    const { dollarPrice, uvaPrice, ratesMeta, loading, error } = useRates();

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-[1200px] px-4 pb-5 pt-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
                    <div className="grid min-w-0 grid-cols-[auto_1fr] gap-x-3 gap-y-1 sm:gap-x-3.5 lg:items-start lg:gap-x-4">
                        <Image
                            src="/icon-website.png"
                            alt=""
                            width={40}
                            height={40}
                            className="col-start-1 row-start-1 h-9 w-9 shrink-0 self-center rounded-lg sm:h-10 sm:w-10 lg:row-span-2 lg:self-start"
                            priority
                        />
                        <h1 className="col-start-2 row-start-1 min-w-0 text-balance align-middle text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                            Simulador de Préstamos Hipotecarios UVA
                        </h1>
                        <p className="col-span-2 row-start-2 text-sm mt-1 text-muted-foreground lg:col-span-1 lg:col-start-2 lg:row-start-2 lg:mt-1">
                            Argentina — estimaciones con datos publicados por entidades financieras
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
}
