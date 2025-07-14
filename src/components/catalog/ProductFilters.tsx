import { Brand, Category, Subcategory, Collection } from '@/types/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ProductFiltersProps {
  brands: Brand[];
  categories: Category[];
  subcategories: Subcategory[];
  collections: Collection[];
  selectedBrandId?: string;
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
  selectedCollectionId?: string;
  onFilterChange: (filters: {
    brandId?: string;
    categoryId?: string;
    subcategoryId?: string;
    collectionId?: string;
  }) => void;
}

export function ProductFilters({
  brands,
  categories,
  subcategories,
  collections,
  selectedBrandId,
  selectedCategoryId,
  selectedSubcategoryId,
  selectedCollectionId,
  onFilterChange,
}: ProductFiltersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Фильтры</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Бренды */}
        <div>
          <h3 className="text-sm font-medium mb-2">Бренды</h3>
          <RadioGroup
            value={selectedBrandId}
            onValueChange={(value) => onFilterChange({ brandId: value })}
          >
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center space-x-2">
                <RadioGroupItem value={brand.id} id={`brand-${brand.id}`} />
                <Label htmlFor={`brand-${brand.id}`}>{brand.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Категории */}
        <div>
          <h3 className="text-sm font-medium mb-2">Категории</h3>
          <RadioGroup
            value={selectedCategoryId}
            onValueChange={(value) => onFilterChange({ categoryId: value })}
          >
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                <Label htmlFor={`category-${category.id}`}>{category.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Подкатегории */}
        {selectedCategoryId && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-2">Подкатегории</h3>
              <RadioGroup
                value={selectedSubcategoryId}
                onValueChange={(value) => onFilterChange({ subcategoryId: value })}
              >
                {subcategories
                  .filter((sub) => sub.category_id === selectedCategoryId)
                  .map((subcategory) => (
                    <div key={subcategory.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={subcategory.id} id={`subcategory-${subcategory.id}`} />
                      <Label htmlFor={`subcategory-${subcategory.id}`}>{subcategory.name}</Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>
          </>
        )}

        {/* Коллекции */}
        {(selectedBrandId || selectedSubcategoryId) && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-medium mb-2">Коллекции</h3>
              <RadioGroup
                value={selectedCollectionId}
                onValueChange={(value) => onFilterChange({ collectionId: value })}
              >
                {collections
                  .filter(
                    (collection) =>
                      (!selectedBrandId || collection.brand_id === selectedBrandId) &&
                      (!selectedSubcategoryId || collection.subcategory_id === selectedSubcategoryId)
                  )
                  .map((collection) => (
                    <div key={collection.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={collection.id} id={`collection-${collection.id}`} />
                      <Label htmlFor={`collection-${collection.id}`}>{collection.name}</Label>
                    </div>
                  ))}
              </RadioGroup>
            </div>
          </>
        )}

        {/* Кнопка сброса фильтров */}
        {(selectedBrandId || selectedCategoryId || selectedSubcategoryId || selectedCollectionId) && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onFilterChange({})}
          >
            Сбросить фильтры
          </Button>
        )}
      </CardContent>
    </Card>
  );
} 