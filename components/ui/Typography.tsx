import { twMerge } from "tailwind-merge";

type TypographyVariant =
  | "display"
  | "heading-xl"
  | "heading-lg"
  | "heading-md"
  | "heading-sm"
  | "body-lg"
  | "body-md"
  | "body-sm"
  | "caption"
  | "badge";

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant: TypographyVariant;
  children: React.ReactNode;
  as?: React.ElementType;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = "body-md",
  as,
  className,
  ...props
}) => {
  const variantTagMap: Record<TypographyVariant, React.ElementType> = {
    display: "h1",
    "heading-xl": "h2",
    "heading-lg": "h3",
    "heading-md": "h4",
    "heading-sm": "h5",
    "body-lg": "p",
    "body-md": "p",
    "body-sm": "p",
    caption: "span",
    badge: "span",
  };

  const variantStyleMap: Record<TypographyVariant, string> = {
    display: "text-5xl md:text-7xl leading-tight text-foreground",
    "heading-xl": "font-bold text-4xl md:text-5xl text-foreground",
    "heading-lg": "font-bold text-3xl md:text-4xl text-foreground",
    "heading-md": "font-semibold text-xl text-foreground",
    "heading-sm":
      "font-semibold text-base text-muted-foreground tracking-wider uppercase",
    "body-lg": "text-lg text-muted-foreground",
    "body-md": "text-base text-muted-foreground",
    "body-sm": "text-sm text-muted-foreground",
    caption: "font-semibold text-sm text-primary",
    badge:
      "inline-block px-3 py-1 font-semibold text-lg uppercase tracking-wider rounded-full bg-primary/20 text-primary",
  };

  const Component = as || variantTagMap[variant];
  const finalClassName = twMerge(variantStyleMap[variant], className);

  return (
    <Component className={finalClassName} {...props}>
      {children}
    </Component>
  );
};
