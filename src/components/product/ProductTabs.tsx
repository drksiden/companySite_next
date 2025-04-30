import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Product {
  description?: string;
  metadata?: { [key: string]: any };
}

interface ProductTabsProps {
  product: Product;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Описание</TabsTrigger>
        <TabsTrigger value="specifications">Характеристики</TabsTrigger>
        <TabsTrigger value="documents">Документы</TabsTrigger>
      </TabsList>
      <TabsContent value="description">
        <p>{product.description || 'Описание отсутствует'}</p>
      </TabsContent>
      <TabsContent value="specifications">
        {product.metadata?.specifications ? (
          <ul className="list-disc pl-5">
            {Object.entries(product.metadata.specifications).map(([key, value]) => (
              <li key={key}>
                {key}: {value}
              </li>
            ))}
          </ul>
        ) : (
          <p>Характеристики отсутствуют</p>
        )}
      </TabsContent>
      <TabsContent value="documents">
        <p>Документы отсутствуют</p>
        {/* Можно добавить ссылки на документы, если они есть в product.metadata */}
      </TabsContent>
    </Tabs>
  );
}