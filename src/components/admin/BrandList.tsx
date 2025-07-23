import { Brand } from '@/lib/services/brand';

interface BrandListProps {
  brands: Brand[];
  onEdit?: (brand: Brand) => void;
  onDelete?: (brand: Brand) => void;
}

export function BrandList({ brands, onEdit, onDelete }: BrandListProps) {
  return (
    <ul>
      {brands.map((brand) => (
        <li key={brand.id} className="flex items-center gap-2 py-1">
          <span>{brand.name}</span>
          {onEdit && <button onClick={() => onEdit(brand)} className="text-blue-600">Редактировать</button>}
          {onDelete && <button onClick={() => onDelete(brand)} className="text-red-600">Удалить</button>}
        </li>
      ))}
    </ul>
  );
} 