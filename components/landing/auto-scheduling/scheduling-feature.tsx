import { Typography } from "@/components/ui/typography";

interface SchedulingFeatureProps {
  icon: React.ElementType;
  title: string;
  description: string;
  colors: string;
}

export function SchedulingFeature({
  icon: Icon,
  title,
  description,
  colors,
}: SchedulingFeatureProps) {
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${colors}`}
      >
        <Icon size={24} />
      </div>
      <div>
        <Typography as="h3" variant="heading-md">
          {title}
        </Typography>
        <Typography variant="body-md" className="mt-1">
          {description}
        </Typography>
      </div>
    </div>
  );
}
