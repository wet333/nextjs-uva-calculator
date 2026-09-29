"use client";

import Image from "next/image";
import Link from "next/link";
import { LiveRatesBar } from "@/components/layout/LiveRatesBar";
import { SiteTabs } from "@/components/layout/SiteTabs";
import { useRates } from "@/components/providers/RatesProvider";

export function Header() {
    const { dollarPrice, uvaPrice, ratesMeta, loading, error } = useRates();

    return (
        <header className="sticky top-0 z-50 border-b border-white/[0.04] bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-[1200px] px-4 pt-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-5">
                    <div className="grid min-w-0 grid-cols-[auto_1fr] gap-x-3 gap-y-1 sm:gap-x-3.5 lg:items-stretch lg:gap-x-4">
                        <Image
                            src="/homehunt-icon.png"
                            alt=""
                            width={64}
                            height={64}
                            className="col-start-1 row-start-1 h-9 w-9 shrink-0 self-center rounded-lg object-contain sm:h-10 sm:w-10 lg:row-span-2 lg:h-full lg:w-full lg:self-stretch"
                            priority
                        />
                        <h1 className="col-start-2 row-start-1 min-w-0 self-center font-display text-xl font-extrabold tracking-[-0.02em] text-foreground sm:text-2xl">
                            <Link
                                href="/"
                                className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                                Home<span className="text-brand">Hunt</span>
                            </Link>
                        </h1>
                        <p className="col-span-2 row-start-2 text-sm mt-1 text-muted-foreground lg:col-span-1 lg:col-start-2 lg:row-start-2 lg:mt-1">
                            Simulá tu crédito UVA, compará bancos y seguí las casas que te interesan
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
                <SiteTabs className="mt-3" />
            </div>
        </header>
    );
}
