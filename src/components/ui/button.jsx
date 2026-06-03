import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    [
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-glow transition-colors hover:bg-primary/90 active:bg-primary/80",
                cta:
                    "rounded-md border border-emerald-700/30 bg-cta font-semibold text-cta-foreground shadow-sm transition-[background-color,border-color,box-shadow] duration-150 hover:border-emerald-500/50 hover:bg-cta-hover hover:shadow-[0_2px_10px_-2px_hsl(168_62%_38%/0.45)] active:border-emerald-700/40 active:bg-cta-active active:shadow-sm",
                destructive:
                    "bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90",
                outline:
                    "border border-border bg-transparent transition-colors hover:bg-secondary hover:text-secondary-foreground",
                secondary:
                    "bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80",
                ghost:
                    "transition-colors hover:bg-secondary hover:text-secondary-foreground",
                link: "text-primary underline-offset-4 transition-colors hover:underline",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 px-8 text-base",
                xl: "h-12 px-10 text-base",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = React.forwardRef(
    (
        { className, variant, size, asChild = false, type = "button", ...props },
        ref
    ) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                type={type}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
