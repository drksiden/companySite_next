import React from "react";
import { cn } from "@/lib/utils";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  description?: string;
  level?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  level = "h2",
  className,
  ...props
}) => {
  const headingElement = React.createElement(
    level,
    {
      className: cn(
        "font-semibold tracking-tight",
        {
          "text-4xl": level === "h1",
          "text-3xl": level === "h2",
          "text-2xl": level === "h3",
          "text-xl": level === "h4",
          "text-lg": level === "h5",
          "text-base": level === "h6",
        },
        className,
      ),
      ...props,
    },
    title,
  );

  return (
    <div className="space-y-1">
      {headingElement}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export { Heading };
