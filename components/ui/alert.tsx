import { cn } from "@/lib/utils";
import React from "react";

export function Alert({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "w-full border rounded-lg p-4 bg-white shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function AlertDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("text-sm text-gray-700", className)} {...props}>
      {children}
    </div>
  );
}
