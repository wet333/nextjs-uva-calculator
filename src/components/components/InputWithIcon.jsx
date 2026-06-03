import React, { Children, cloneElement } from "react";
import { Label } from "@/components/ui/label";
import { CircleHelp } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const helpTooltip = (message) => (
  <HoverCard openDelay={100} closeDelay={200}>
    <HoverCardTrigger asChild>
      <button
        type="button"
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label={message}
      >
        <CircleHelp
          className="h-4 w-4 translate-x-0.5 -translate-y-px"
          aria-hidden="true"
        />
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
  compact = false,
  children,
}) {
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="flex min-w-0 flex-col">
      <Label
        className={
          compact
            ? "mb-1 flex items-center gap-1 px-0.5 text-xs font-medium text-foreground sm:text-sm"
            : "mb-2 flex items-center gap-1.5 px-0.5 text-sm font-medium text-foreground"
        }
        htmlFor={htmlFor}
      >
        {labelText}
        {helpMsg ? helpTooltip(helpMsg) : null}
      </Label>
      <div
        className={
          compact
            ? "group relative w-full [&_input]:h-9 [&_input]:py-1.5 [&_input]:pl-7 [&_select]:h-9 [&_select]:py-1.5 [&_select]:pl-7"
            : "group relative w-full [&_input]:pl-8 [&_select]:pl-8"
        }
      >
        {Icon && (
          <div
            className={
              compact
                ? "pointer-events-none absolute inset-y-0 left-0 z-10 flex w-8 items-center justify-center"
                : "pointer-events-none absolute inset-y-0 left-0 z-10 flex w-10 items-center justify-center"
            }
          >
            <Icon
              className="h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary"
              aria-hidden="true"
            />
          </div>
        )}
        {Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return cloneElement(child, {
              className: `${child.props.className || ""} ${error ? "border-destructive focus-visible:ring-destructive" : ""}`,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": errorId,
            });
          }
          return child;
        })}
      </div>
      {error ? (
        <p
          id={errorId}
          role="alert"
          className={
            compact
              ? "mt-1 text-xs text-destructive"
              : "mt-1.5 text-sm text-destructive"
          }
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default InputWithIcon;
