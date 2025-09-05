"use client";
import { useState } from "react";
import { PricingCard } from "./pricing-card";
import { PricingToggle } from "./pricing-toggle";
import { Database } from "@/types/supabase";

type Plan = Database["public"]["Tables"]["plans"]["Row"];

export function PricingClientComponent({ plans }: { plans: Plan[] }) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">(
    "monthly"
  );

  const handleToggle = () => {
    setBillingCycle((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  return (
    <>
      <PricingToggle billingCycle={billingCycle} onToggle={handleToggle} />
      <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard key={plan.id} plan={plan} billingCycle={billingCycle} />
        ))}
      </div>
    </>
  );
}
