import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const selectStyles =
    "field-control appearance-none py-2 pl-3 pr-10";

const Select = React.forwardRef(({ className, children, ...props }, ref) => (
    <div className="relative w-full">
        <select ref={ref} className={cn(selectStyles, className)} {...props}>
            {children}
        </select>
        <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
        />
    </div>
));
Select.displayName = "Select";

export { Select };
