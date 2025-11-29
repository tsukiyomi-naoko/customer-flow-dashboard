import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "secondary";
}

export function Badge({ className, variant = "secondary", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    secondary: "bg-slate-100 text-slate-800 border border-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
