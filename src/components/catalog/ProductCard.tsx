import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types/catalog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/catalog/products/${product.id}`} className="group block h-full">
      <Card className="relative flex flex-col overflow-hidden h-[340px] max-h-[340px] transition-shadow group-hover:shadow-2xl">
        <CardHeader className="p-0">
          <div className="bg-muted h-40 w-full flex items-center justify-center overflow-hidden">
            {product.thumbnail ? (
              <Image
                src={product.thumbnail}
                alt={product.title}
                width={320}
                height={160}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-muted-foreground">Нет изображения</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="text-base font-semibold mb-2 line-clamp-2">{product.title}</h3>
          {typeof product.price === 'number' ? (
            <p className="text-2xl font-bold text-primary mb-2">{product.price.toLocaleString('ru-RU')} ₽</p>
          ) : (
            <p className="text-2xl font-bold text-muted-foreground mb-2">Цена по запросу</p>
          )}
        </CardContent>
        {/* Абсолютно позиционированный блок с инфой при наведении */}
        <div className="absolute left-0 right-0 bottom-0 z-20 bg-card p-4 rounded-b-lg shadow-lg opacity-0 pointer-events-none translate-y-2 group-hover:opacity-100 group-hover:pointer-events-auto group-hover:translate-y-0 transition-all duration-300">
          <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{product.description}</p>
          {product.brand && (
            <Badge variant="secondary" className="mb-2 w-fit">
              {product.brand.name}
            </Badge>
          )}
          <button className="mt-2 w-full py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition">В корзину</button>
        </div>
        <CardFooter className="p-4 pt-0 z-10">
          {/* Можно добавить что-то ещё, если нужно */}
        </CardFooter>
      </Card>
    </Link>
  );
} 