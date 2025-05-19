// src/components/product/ProductTabs.tsx
'use client';

import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown, { Options as ReactMarkdownOptions } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductMetadata {
  specifications?: Record<string, any> | null;
  documents?: Array<{ name: string; url: string; type?: string }> | null;
  [key: string]: any; 
}

interface Product {
  description?: string | null;
  metadata?: ProductMetadata | null;
}

interface ProductTabsProps {
  product: Product;
  className?: string;
}

function SpecificationsTable({ specs }: { specs: Record<string, any> }) {
  return (
    <div className="overflow-x-auto rounded-lg border bg-card text-card-foreground shadow-sm">
      <table className="min-w-full w-full text-sm">
        <tbody className="divide-y divide-border">
          {Object.entries(specs).map(([key, value], index) => (
            <tr key={key} className={cn("hover:bg-muted/50 transition-colors", index % 2 === 0 ? 'bg-card' : 'bg-muted/20')}>
              <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap capitalize">{key.replace(/_/g, ' ')}</td>
              {/* Ensure value is a string or number before rendering */}
              <td className="py-3 px-4 text-muted-foreground">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocumentsList({ docs }: { docs: Array<{ name: string; url: string; type?: string }> }) {
  return (
    <ul className="space-y-3">
      {docs.map((doc, index) => (
        <li key={index} className="p-3 border rounded-md bg-muted/30 hover:bg-muted/60 transition-colors">
          <a
            href={doc.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline underline-offset-2 flex items-center justify-between"
          >
            <span>{doc.name}</span>
            {doc.type && <span className="text-xs text-muted-foreground uppercase bg-accent px-2 py-0.5 rounded-sm">{doc.type}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function ProductTabs({ product, className }: ProductTabsProps) {
  const TABS_CONFIG = useMemo(() => [
    {
      value: 'description',
      label: 'Описание',
      hasContent: typeof product.description === 'string' && product.description.trim() !== '',
      content: () => {
        if (typeof product.description === 'string' && product.description.trim() !== '') {
          return (
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none w-full break-words 
                         prose-headings:font-semibold prose-headings:text-card-foreground
                         prose-p:text-muted-foreground
                         prose-a:text-primary hover:prose-a:text-primary/80
                         prose-strong:text-card-foreground
                         prose-code:bg-muted prose-code:text-foreground prose-code:p-1 prose-code:rounded-sm prose-code:break-all
                         prose-blockquote:border-primary prose-blockquote:text-muted-foreground
                         prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                         prose-li:marker:text-primary
                         prose-table:border prose-table:border-collapse prose-table:border-border
                         prose-th:border prose-th:p-2 prose-th:bg-muted
                         prose-td:border prose-td:p-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {product.description}
              </ReactMarkdown>
            </div>
          );
        }
        return <p className="text-muted-foreground py-4 text-center">Описание отсутствует.</p>;
      }
    },
    {
      value: 'specifications',
      label: 'Характеристики',
      hasContent: !!(product.metadata?.specifications && Object.keys(product.metadata.specifications).length > 0),
      content: () => product.metadata?.specifications && Object.keys(product.metadata.specifications).length > 0 ? (
        <SpecificationsTable specs={product.metadata.specifications} />
      ) : <p className="text-muted-foreground py-4 text-center">Характеристики отсутствуют.</p>
    },
    {
      value: 'documents',
      label: 'Документы',
      hasContent: !!(product.metadata?.documents && product.metadata.documents.length > 0),
      content: () => product.metadata?.documents && product.metadata.documents.length > 0 ? (
        <DocumentsList docs={product.metadata.documents} />
      ) : <p className="text-muted-foreground py-4 text-center">Документы отсутствуют.</p>
    },
  ], [product]);

  const availableTabs = useMemo(() => {
    const filtered = TABS_CONFIG.filter(tab => tab.hasContent);
    // If no tabs have actual content, default to showing the "Описание" tab (which will display "Описание отсутствует").
    return filtered.length > 0 ? filtered : [TABS_CONFIG[0]];
  }, [TABS_CONFIG]);

  const [activeTab, setActiveTab] = useState<string>(availableTabs[0].value);

  const activeTabContent = useMemo(() => {
    const current = TABS_CONFIG.find(tab => tab.value === activeTab);
    return current ? current.content() : <p className="text-muted-foreground py-4 text-center">Контент не найден.</p>;
  }, [activeTab, TABS_CONFIG]);

  // If the only available tab is "Описание" and it has no content, don't render tabs.
  if (availableTabs.length === 1 && availableTabs[0].value === 'description' && !TABS_CONFIG[0].hasContent) {
    return null; 
  }

  return (
    <Tabs
      value={activeTab} // Controlled component
      onValueChange={setActiveTab}
      className={cn("w-full mt-10 sm:mt-12", className)}
    >
      <TabsList className={cn(
        "grid w-full h-auto rounded-lg p-1 bg-muted",
        availableTabs.length === 1 && "grid-cols-1",
        availableTabs.length === 2 && "grid-cols-2",
        availableTabs.length >= 3 && "sm:grid-cols-3 grid-cols-1" 
      )}>
        {availableTabs.map(tab => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="py-2 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab} // Key change triggers animation
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {/* The content is now directly rendered, not via TabsContent for AnimatePresence to work better */}
            <Card className="bg-card border shadow-sm">
              <CardContent className="p-4 sm:p-6">
                {/* ScrollArea for vertical scrolling. Horizontal scrolling for description is handled by the inner div. */}
                <ScrollArea className="max-h-[60vh] w-full pr-3"> 
                  {activeTabContent}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </Tabs>
  );
}
