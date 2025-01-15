import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ReactNode } from "react";

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
}

export function Tooltip({ children, content }: TooltipProps) {
    return (
        <TooltipPrimitive.Provider>
            <TooltipPrimitive.Root>
                <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
                <TooltipPrimitive.Content sideOffset={5}>
                    <div className="rounded bg-black px-2 py-1 text-xs text-white">{content}</div>
                    <TooltipPrimitive.Arrow className="fill-black" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
}
