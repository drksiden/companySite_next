
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Product {
  description?: string;
  metadata?: { [key: string]: any };
}

interface ProductTabsProps {
  product: Product;
}

const tabKeys = ['description', 'specifications', 'documents'] as const;
type TabKey = typeof tabKeys[number];

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('description');

  // Helper to render specifications as a table
  function renderSpecificationsTable(specs: Record<string, any>) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-muted rounded-lg text-sm">
          <tbody>
            {Object.entries(specs).map(([key, value]) => (
              <tr key={key} className="even:bg-muted/40">
                <td className="py-2 px-4 font-medium border-b border-muted-foreground/10 whitespace-nowrap">{key}</td>
                <td className="py-2 px-4 border-b border-muted-foreground/10">{String(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="description"
      value={activeTab}
      onValueChange={val => setActiveTab(val as TabKey)}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Описание</TabsTrigger>
        <TabsTrigger value="specifications">Характеристики</TabsTrigger>
        <TabsTrigger value="documents">Документы</TabsTrigger>
      </TabsList>

      {tabKeys.map(tab => (
        <TabsContent key={tab} value={tab} forceMount>
          <AnimatePresence mode="wait">
            {activeTab === tab && (
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {tab === 'description' && (
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    {product.description ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {product.description}
                      </ReactMarkdown>
                    ) : (
                      <p>Описание отсутствует</p>
                    )}
                  </div>
                )}
                {tab === 'specifications' && (
                  product.metadata?.specifications && Object.keys(product.metadata.specifications).length > 0 ? (
                    renderSpecificationsTable(product.metadata.specifications)
                  ) : (
                    <p>Характеристики отсутствуют</p>
                  )
                )}
                {tab === 'documents' && (
                  <>
                    <p>Документы отсутствуют</p>
                    {/* Можно добавить ссылки на документы, если они есть в product.metadata */}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>
      ))}
    </Tabs>
  );
}
