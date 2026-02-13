"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

const Tooltip = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);

    return (
        <div
            className="relative inline-block group"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {React.Children.map(children, child => {
                if (React.isValidElement(child)) {
                    // @ts-ignore
                    return React.cloneElement(child, { open });
                }
                return child;
            })}
        </div>
    );
};

const TooltipTrigger = React.forwardRef<
    HTMLButtonElement | HTMLSpanElement, // Support span for wrapping text/icons
    React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ className, asChild, ...props }, ref) => {
    const Comp = asChild ? React.Fragment : "button";
    // If asChild is true, we just render children, but we need to ensure they get the ref/events
    // For this simple implementation, if asChild is used, the user is responsible for the trigger element.
    // However, my simple Tooltip implementation wraps everything in a div with group/hover, 
    // so Trigger mostly just needs to render.

    if (asChild) {
        return <>{props.children}</>;
    }

    return (
        // @ts-ignore
        <button ref={ref} className={cn(className)} {...props} />
    );
});
TooltipTrigger.displayName = "TooltipTrigger";

const TooltipContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { side?: "top" | "bottom" | "left" | "right" }
>(({ className, side = "top", ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 overflow-hidden rounded-md border bg-neutral-900 px-3 py-1.5 text-xs text-neutral-100 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                // Positioning logic (simplified)
                "invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200",
                side === "bottom" ? "top-full mt-2 left-1/2 -translate-x-1/2" :
                    side === "top" ? "bottom-full mb-2 left-1/2 -translate-x-1/2" : "",
                className
            )}
            {...props}
        />
    );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
