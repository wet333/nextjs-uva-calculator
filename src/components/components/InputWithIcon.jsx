import React, { Children, cloneElement } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CircleHelp } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const helpTooltip = (message) => (
  <HoverCard openDelay={100} closeDelay={200}>
    <HoverCardTrigger asChild>
      <CircleHelp
        className={
          "w-[16px] h-[16px] transform translate-y-[-3px] translate-x-[3px] cursor-pointer"
        }
      />
    </HoverCardTrigger>
    <HoverCardContent side={"top"} className={"bg-slate-700"}>
      <div className={"font-light"}>
        <p className={"text-[12px]"}>{message}</p>
      </div>
    </HoverCardContent>
  </HoverCard>
);

function InputWithIcon({ icon: Icon, labelText, htmlFor, helpMsg, children }) {
  return (
    <div className="flex flex-col">
      <Label
        className="flex px-1 mb-3 font-bold text-slate-300"
        htmlFor={htmlFor}
      >
        {labelText} {helpMsg ? helpTooltip(helpMsg) : null}
      </Label>
      <div className="flex flex-col relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <div className="relative w-full">
          {Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === Input) {
              return cloneElement(child, {
                className: `${child.props.className || ""} pl-8 pr-4 m-auto`,
              });
            }
            return child;
          })}
        </div>
      </div>
    </div>
  );
}

export default InputWithIcon;
