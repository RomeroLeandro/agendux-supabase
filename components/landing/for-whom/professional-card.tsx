import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { Check } from "lucide-react";

interface ProfessionalCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
}

const IconWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary">
      {children}
    </div>
  );
};

export function ProfessionalCard({
  icon: Icon,
  title,
  description,
  features,
}: ProfessionalCardProps) {
  return (
    <Card className="text-left">
      <IconWrapper>
        <Icon size={32} />
      </IconWrapper>
      <Typography
        variant="heading-md"
        as="h3"
        className="font-bold text-foreground"
      >
        {title}
      </Typography>
      <Typography variant="body-md" className="mt-2 text-muted-foreground">
        {description}
      </Typography>
      <ul className="mt-6 space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-3">
            <Check className="h-5 w-5 text-accent" />
            <Typography as="span" variant="body-md" className="text-foreground">
              {feature}
            </Typography>
          </li>
        ))}
      </ul>
    </Card>
  );
}
