"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
  variant?: "default" | "compact" | "product";
}

export function MarkdownContent({
  content,
  className,
  variant = "default",
}: MarkdownContentProps) {
  const baseStyles = {
    default: "prose prose-lg max-w-none dark:prose-invert",
    compact: "prose prose-sm max-w-none dark:prose-invert",
    product:
      "prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-blockquote:border-primary prose-blockquote:text-muted-foreground prose-code:text-primary prose-pre:bg-muted prose-pre:text-foreground",
  };

  return (
    <div className={cn(baseStyles[variant], className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-foreground mb-6 mt-8 first:mt-0 border-b pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-foreground mb-4 mt-8 first:mt-0 border-b pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-foreground mb-3 mt-6 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-foreground mb-2 mt-4 first:mt-0">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-semibold text-foreground mb-2 mt-4 first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-semibold text-foreground mb-2 mt-4 first:mt-0 uppercase tracking-wider">
              {children}
            </h6>
          ),
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed mb-4 text-base">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground mb-4 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-muted-foreground leading-relaxed">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-6 py-2 italic text-muted-foreground my-6 bg-muted/30 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }) => {
            const inline = !props.className?.includes("language-");
            return inline ? (
              <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary border">
                {children}
              </code>
            ) : (
              <code className="block bg-muted p-4 rounded-lg text-sm font-mono text-foreground overflow-x-auto border">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto border mb-4">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors font-medium"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">{children}</em>
          ),
          hr: () => <hr className="border-border my-8 border-t-2" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border hover:bg-muted/50 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="text-left p-3 font-semibold text-foreground border-r border-border last:border-r-0">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="p-3 text-muted-foreground border-r border-border last:border-r-0">
              {children}
            </td>
          ),
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto rounded-lg shadow-md my-4 border"
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
