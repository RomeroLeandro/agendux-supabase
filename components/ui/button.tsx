import * as React from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg" | "icon";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
}

export const Button = ({
  children,
  className = "",
  fullWidth = false,
  size = "md",
  variant = "primary",
  ...props
}: ButtonProps) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-lg transition-opacity focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles: Record<NonNullable<ButtonProps["size"]>, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2",
  };

  const variantStyles: Record<NonNullable<ButtonProps["variant"]>, string> = {
    primary:
      "bg-gradient-to-r from-[hsl(var(--azul-secundario))] to-[hsl(var(--azul-primario))] text-white shadow-md hover:opacity-90 focus:ring-primary",
    secondary:
      "bg-[hsl(var(--azul-secundario))] text-white shadow-sm hover:opacity-90 focus:ring-[hsl(var(--azul-secundario))]",
    outline:
      "border border-[hsl(var(--azul-primario))] text-[hsl(var(--azul-primario))] bg-transparent hover:bg-[hsl(var(--azul-primario)/0.06)] focus:ring-[hsl(var(--azul-primario))]",
    ghost:
      "bg-transparent text-[hsl(var(--azul-primario))] shadow-none hover:bg-[hsl(var(--azul-primario)/0.06)] focus:ring-[hsl(var(--azul-primario))]",
    danger:
      "bg-red-500 text-white shadow-sm hover:bg-red-600 focus:ring-red-500",
  };

  const fullWidthClass = fullWidth ? "w-full" : "";

  const finalClassName = twMerge(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    fullWidthClass,
    className
  );

  return (
    <button className={finalClassName} {...props}>
      {children}
    </button>
  );
};
