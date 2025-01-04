import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const switchVariants = cva("relative inline-flex items-center cursor-pointer", {
    variants: {
        size: {
            default: "w-11 h-6",
            sm: "w-9 h-5",
            lg: "w-14 h-7"
        }
    },
    defaultVariants: {
        size: "default"
    }
});

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">, VariantProps<typeof switchVariants> {
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ id, checked, onCheckedChange, className, size, ...props }, ref) => {
    return (
        <label className={cn(switchVariants({ size, className }))}>
            <input type="checkbox" id={id} checked={checked} onChange={e => onCheckedChange(e.target.checked)} className="sr-only" ref={ref} {...props} />
            <div className={`h-full w-full rounded-full ${checked ? "bg-purple-500" : "bg-gray-200 dark:bg-gray-400"} relative`}>
                <div
                    className={`absolute left-[2px] top-0.5 h-5 w-5 rounded-full border border-gray-300 bg-white ${checked ? "translate-x-full" : ""}`}
                    style={{ transform: checked ? "translateX(calc(100% - 2px))" : "translateX(0)" }}
                ></div>
            </div>
        </label>
    );
});
Switch.displayName = "Switch";

export { Switch, switchVariants };
