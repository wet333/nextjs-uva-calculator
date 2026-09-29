"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, House } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
    {
        href: "/",
        label: "Simulador UVA",
        icon: Calculator,
        isActive: (pathname) => pathname === "/",
    },
    {
        href: "/casas",
        label: "Mis casas",
        icon: House,
        isActive: (pathname) => pathname.startsWith("/casas"),
    },
];

export function SiteTabs({ className }) {
    const pathname = usePathname() ?? "/";

    return (
        <nav aria-label="Secciones del sitio" className={cn("-mb-px flex", className)}>
            {TABS.map(({ href, label, icon: Icon, isActive }) => {
                const active = isActive(pathname);
                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            "inline-flex h-11 flex-1 items-center justify-center gap-2 border-b-2 px-4 text-sm font-medium transition-colors sm:flex-none",
                            "rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                            active
                                ? "border-primary text-foreground"
                                : "border-transparent text-muted-foreground hover:border-white/[0.12] hover:text-foreground"
                        )}
                    >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
