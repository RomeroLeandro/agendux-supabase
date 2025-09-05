"use client";

import { twMerge } from "tailwind-merge";

type CardVariant = "default" | "featured";

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variantStyles = {
    default:
      "bg-background dark:bg-card transition-colors duration-300 border border-gray-200 dark:border-gray-800 shadow-md",
    featured:
      "bg-background dark:bg-card transition-colors duration-300 border border-4 border-primary shadow-md ",
  };

  const baseStyles = "rounded-2xl p-6 md:p-8 h-full";

  const finalClassName = twMerge(baseStyles, variantStyles[variant], className);
  return <div className={finalClassName}>{children}</div>;
};
