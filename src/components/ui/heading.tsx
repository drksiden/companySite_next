import React, { JSX } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for tailwind-merge/clsx

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  title: string;
  description?: string;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const Heading: React.FC<HeadingProps> = ({
  title,
  description,
  level = 'h2', // Default to h2 as it's common for page titles
  className,
  ...props
}) => {
  const Hx = level as keyof JSX.IntrinsicElements; // Dynamically render h1-h6

  return (
    <div className="space-y-1">
      <Hx
        className={cn(
          'font-semibold tracking-tight',
          {
            'text-4xl': level === 'h1',
            'text-3xl': level === 'h2',
            'text-2xl': level === 'h3',
            'text-xl': level === 'h4',
            'text-lg': level === 'h5',
            'text-base': level === 'h6',
          },
          className
        )}
        {...props}
      >
        {title}
      </Hx>
      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

export { Heading };