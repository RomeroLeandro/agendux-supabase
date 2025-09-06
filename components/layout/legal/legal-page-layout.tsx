import { Typography } from "@/components/ui/typography";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPageLayout({
  title,
  subtitle,
  lastUpdated,
  children,
}: LegalPageLayoutProps) {
  return (
    <div className="bg-background min-h-screen py-2">
      <div className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
        <header className="text-center">
          <Typography as="h1" variant="heading-xl" className="text-primary">
            {title}
          </Typography>
          <Typography as="p" variant="body-lg" className="mt-4 text-foreground">
            {subtitle}
          </Typography>
          <Typography
            as="p"
            variant="body-sm"
            className="mt-2 text-secondary-foreground"
          >
            Última actualización: {lastUpdated}
          </Typography>
        </header>

        <article className="prose prose-lg dark:prose-invert mt-12 max-w-none">
          {children}
        </article>
      </div>
    </div>
  );
}
