// src/components/ui/Card.tsx

import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-white/70 bg-white/90 shadow-[0_24px_80px_rgba(16,24,40,0.10)] backdrop-blur animate-[fadeIn_0.4s_ease]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div className={cn("mb-6 text-center", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn("space-y-4", className)} {...props} />;
}