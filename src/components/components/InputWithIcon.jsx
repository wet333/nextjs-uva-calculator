import React from "react";
import { Label } from "@/components/ui/label";
import { CircleHelp } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

const helpTooltip = (message) => (
  <HoverCard openDelay={100} closeDelay={200}>
    <HoverCardTrigger asChild>
      <button
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={message}
      >
        <CircleHelp className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </HoverCardTrigger>
    <HoverCardContent
      side="top"
      className="border-border bg-popover text-popover-foreground"
    >
      <p className="text-xs leading-relaxed">{message}</p>
    </HoverCardContent>
  </HoverCard>
);

function InputWithIcon({
  icon: Icon,
  labelText,
  htmlFor,
  helpMsg,
  error,
  children,
}) {
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label
        className="flex items-center gap-1 text-sm font-medium text-foreground"
        htmlFor={htmlFor}
      >
        {labelText}
        {helpMsg ? helpTooltip(helpMsg) : null}
      </Label>
      <div
        className={cn(
          "group relative w-full",
          Icon && "[&_input]:pl-9 [&_select]:pl-9",
          "focus-within:[&_.field-icon]:text-primary",
          error &&
            "[&_input]:ring-destructive/40 [&_input]:focus-visible:ring-destructive/50 [&_select]:ring-destructive/40 [&_select]:focus-visible:ring-destructive/50"
        )}
      >
        {Icon ? (
          <div
            className="field-icon pointer-events-none absolute left-0 top-0 z-10 flex h-10 w-9 items-center justify-center text-muted-foreground transition-colors duration-150"
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
        {children}
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs leading-relaxed text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default InputWithIcon;
