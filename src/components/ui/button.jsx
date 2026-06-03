import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    [
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    ],
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-panel transition-[background-color,box-shadow] duration-150 hover:bg-primary/90 active:bg-primary/80",
                cta:
                    "bg-cta text-cta-foreground shadow-panel transition-[background-color,box-shadow] duration-150 hover:bg-cta-hover active:bg-cta-active",
                destructive:
                    "bg-destructive text-destructive-foreground transition-[background-color] duration-150 hover:bg-destructive/90",
                outline:
                    "bg-white/[0.03] ring-1 ring-white/[0.08] transition-[background-color,box-shadow] duration-150 hover:bg-white/[0.06] hover:ring-white/[0.12]",
                secondary:
                    "bg-secondary/80 text-secondary-foreground transition-[background-color] duration-150 hover:bg-secondary",
                ghost:
                    "transition-[background-color] duration-150 hover:bg-white/[0.04]",
                link: "text-primary underline-offset-4 transition-[color] duration-150 hover:underline",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-9 px-4",
                lg: "h-10 px-6",
                xl: "h-11 px-8 text-base",
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
