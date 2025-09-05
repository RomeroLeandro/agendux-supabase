import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Check } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/supabase";

type Plan = Database["public"]["Tables"]["plans"]["Row"];

interface PricingCardProps {
  plan: Plan;
  billingCycle: "monthly" | "annually";
}

export function PricingCard({ plan, billingCycle }: PricingCardProps) {
  const isFeatured = plan.is_featured;
  const price =
    billingCycle === "monthly" ? plan.price_monthly : plan.price_annual;
  const billingPeriod = billingCycle === "annually" ? "/año" : "/mes";

  return (
    <Card
      variant={isFeatured ? "featured" : "default"}
      className="flex flex-col p-8"
    >
      <Typography
        as="h3"
        variant="heading-md"
        className="text-left text-foreground"
      >
        {plan.name}
      </Typography>

      <div className="my-6 text-left">
        <span className="text-6xl font-adineue font-bold text-foreground">
          USD {price}
        </span>
        <span className="text-3xl font-adineue text-muted-foreground">
          {billingPeriod}
        </span>
      </div>

      <Typography
        as="p"
        variant="body-md"
        className="text-left text-muted-foreground"
      >
        {plan.description}
      </Typography>

      <ul className="mt-8 mb-6 flex-grow space-y-3 text-left">
        {plan.features.map((feature: string) => (
          <li key={feature} className="flex items-center gap-3">
            <Check className="h-5 w-5 text-accent" />
            <Typography as="span" variant="body-md" className="text-foreground">
              {feature}
            </Typography>
          </li>
        ))}
      </ul>
      <Typography
        as="span"
        variant="body-sm"
        className="text-left pb-4 text-muted-foreground"
      >
        Costo por recordatorio excedente: USD {plan.cost_per_extra_reminder}
      </Typography>

      <Link href="/auth/login" className="mt-auto">
        <Button className="w-full">Empieza gratis</Button>
      </Link>
    </Card>
  );
}
