// app/dashboard/[id]/subscription/change-plan-section.tsx
"use client";

import { useState } from "react";
import { Typography } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { PricingCard } from "@/components/landing/pricing/pricing-card";
import type { Database } from "@/types/supabase";

type Plan = Database["public"]["Tables"]["plans"]["Row"];

interface ChangePlanSectionProps {
  plans: Plan[];
  currentPlanId: number | null;
  billingCycle: "monthly" | "annually";
}

export function ChangePlanSection({
  plans,
  currentPlanId,
  billingCycle,
}: ChangePlanSectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(
    currentPlanId
  );

  const handleSelectPlan = (planId: number) => {
    setSelectedPlanId(planId);
    // TODO: acá luego conectás con Stripe / Supabase para realmente cambiar el plan.
    console.log("Cambiar a plan:", planId);
  };

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="heading-md" className="font-semibold mb-1">
          Cambiar Plan
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground">
          Elige el plan que mejor se adapte a tu consultorio. Podrás confirmar
          el cambio más adelante.
        </Typography>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const isSelected = plan.id === selectedPlanId;

          return (
            <div key={plan.id} className="relative">
              {plan.is_featured && (
                <Badge className="absolute left-1/2 -translate-x-1/2 -top-3 bg-purple-600 text-xs">
                  Más Popular
                </Badge>
              )}
              {isCurrent && (
                <Badge className="absolute right-4 top-4 bg-emerald-500 text-xs">
                  Plan Actual
                </Badge>
              )}

              <PricingCard
                plan={plan}
                billingCycle={billingCycle}
                showCta
                ctaLabel={
                  isCurrent
                    ? "Plan Actual"
                    : isSelected
                    ? "Plan seleccionado"
                    : "Cambiar a este Plan"
                }
                ctaDisabled={isCurrent}
                onCtaClick={() => handleSelectPlan(plan.id)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
