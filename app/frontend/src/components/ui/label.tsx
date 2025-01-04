import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const labelVariants = cva("block text-sm font-medium text-gray-700", {
    variants: {
        size: {
            default: "text-base",
            sm: "text-sm",
            lg: "text-lg"
        }
    },
    defaultVariants: {
        size: "default"
    }
});

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(({ className, size, ...props }, ref) => {
    return <label className={cn(labelVariants({ size, className }))} ref={ref} {...props} />;
});
Label.displayName = "Label";

export { Label, labelVariants };
