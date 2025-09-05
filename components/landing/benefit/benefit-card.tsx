import { Card } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";

interface BenefitCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  colors: string;
}

export function BenefitCard({
  icon: Icon,
  title,
  description,
  colors,
}: BenefitCardProps) {
  return (
    <Card className="text-left p-6">
      <div
        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${colors}`}
      >
        <Icon size={24} />
      </div>

      <Typography variant="heading-md" as="h3">
        {title}
      </Typography>

      <Typography variant="body-md" className="mt-2">
        {description}
      </Typography>
    </Card>
  );
}
