import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const selectStyles =
    "flex h-10 w-full appearance-none rounded-md border border-border bg-input py-2 pl-3 pr-10 text-sm text-foreground shadow-sm transition-[border-color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:border-border/60 disabled:bg-muted/40 disabled:text-muted-foreground disabled:opacity-100";

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
    <div className="relative">
        <select ref={ref} className={cn(selectStyles, className)} {...props}>
            {children}
        </select>
        <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
        />
    </div>
));
Select.displayName = "Select";

export { Select };
