"use client";

import clsx from "clsx";

interface PricingToggleProps {
  billingCycle: "monthly" | "annually";
  onToggle: () => void;
}

export function PricingToggle({ billingCycle, onToggle }: PricingToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-muted">
      <button
        onClick={onToggle}
        className={clsx(
          "rounded-md px-4 py-1 text-sm font-semibold transition-colors ",
          {
            "bg-primary text-primary-foreground": billingCycle === "monthly",
            "text-foreground hover:text-muted-foreground":
              billingCycle !== "monthly",
          }
        )}
      >
        Mensual
      </button>
      <button
        onClick={onToggle}
        className={clsx(
          "rounded-md px-4 py-1 text-sm font-semibold transition-colors",
          {
            "bg-primary text-primary-foreground": billingCycle === "annually",
            "text-foreground hover:text-muted-foreground":
              billingCycle !== "annually",
          }
        )}
      >
        Anual
      </button>
    </div>
  );
}
