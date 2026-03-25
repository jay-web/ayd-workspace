// src/components/ui/Button.tsx

"use client";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
  loading?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  loading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading}
      className={cn(
        "group flex items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
        variant === "primary" &&
        "bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 hover:from-black hover:to-gray-900 active:scale-[0.98]",
        variant === "secondary" &&
        "border border-gray-200 bg-white text-gray-800 hover:bg-gray-50",
        loading && "pointer-events-none opacity-60",
        className
      )}
      {...props}
    >
      <>
  {loading && (
    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
  )}
  <span>{children}</span>
  {!loading && (
    <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">
      →
    </span>
  )}
</>
    </button>
  );
}