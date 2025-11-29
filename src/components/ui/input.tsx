import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm " +
          "placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 " +
          "focus-visible:ring-sky-500",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
