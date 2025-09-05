import { Typography } from "@/components/ui/typography";

interface StepFeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
  iconColor?: string;
}

export function StepFeature({
  icon: Icon,
  title,
  description,
  iconColor,
}: StepFeatureProps) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <Icon className={iconColor || "text-primary"} />
      </div>
      <div>
        <Typography
          as="h4"
          variant="body-lg"
          className="font-bold text-foreground"
        >
          {title}
        </Typography>
        <Typography variant="body-md" className="mt-1 text-muted-foreground">
          {description}
        </Typography>
      </div>
    </div>
  );
}
