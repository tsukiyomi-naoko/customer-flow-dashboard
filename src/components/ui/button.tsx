import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md";
}

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const variants: Record<string, string> = {
    default: "bg-sky-600 text-white hover:bg-sky-700",
    outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800",
    ghost: "hover:bg-slate-100 text-slate-800",
  };

  const sizes: Record<string, string> = {
    sm: "h-8 px-2.5",
    md: "h-9 px-3",
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
