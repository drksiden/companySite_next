'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductForm } from '@/components/admin/ProductForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  Product,
  Category,
  Brand,
  Collection,
  Currency,
  ProductFormData
} from '@/types/catalog'; 
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Loader2, Edit, ArrowUpDown, MoreHorizontal, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

interface ProductManagerClientProps {
  initialProducts: Product[];
  categories: Category[];
  brands: Brand[];
  collections: Collection[];
  currencies: Currency[];
}

export function ProductManagerClient({
  initialProducts,
  categories,
  brands,
  collections,
  currencies,
}: ProductManagerClientProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [productIdsToDelete, setProductIdsToDelete] = useState<string[]>([]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const kztCurrency = currencies.find(c => c.code === 'KZT');
  const kztCurrencyId = kztCurrency?.id;

  const handleCreateNewProduct = () => {
    const newProductDefaultData: Partial<ProductFormData> = {
      currency_id: kztCurrencyId,
    };
    setEditingProduct(newProductDefaultData as Product);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (productIds: string[]) => {
    setProductIdsToDelete(productIds);
    setIsAlertDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    setIsAlertDialogOpen(false);
    try {
      const deletePromises = productIdsToDelete.map(productId =>
        fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      );

      const responses = await Promise.all(deletePromises);
      const failedResponses = responses.filter(res => !res.ok);

      if (failedResponses.length > 0) {
        throw new Error('Некоторые товары не были удалены.');
      }

      setProducts(products.filter(p => !productIdsToDelete.includes(p.id)));
      setRowSelection({});
      toast.success(`${productIdsToDelete.length > 1 ? productIdsToDelete.length + ' товаров' : 'Товар'} успешно удален!`);
    } catch (error: any) {
      console.error('Ошибка при удалении:', error);
      toast.error(error.message || 'Произошла ошибка при удалении.');
    } finally {
      setIsDeleting(false);
      setProductIdsToDelete([]);
    }
  };
  
  const handleFormSubmit = async (data: ProductFormData, imageFiles: File[]) => {
    setIsSubmitting(true);
    try {
      const isEditing = !!data.id;
      const endpoint = isEditing ? `/api/admin/products/${data.id}` : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const formData = new FormData();
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value.toString());
          } else if (Array.isArray(value)) {
            value.forEach(item => formData.append(`${key}[]`, item));
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value as string);
          }
        }
      });

      if (!isEditing && kztCurrencyId) {
        formData.append('currency_id', kztCurrencyId);
      }
      
      imageFiles.forEach(file => {
        formData.append('imageFiles', file);
      });

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Ошибка при ${isEditing ? 'обновлении' : 'создании'} товара.`);
      }

      const updatedProduct: Product = await response.json();

      if (isEditing) {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        toast.success('Товар успешно обновлен!');
      } else {
        setProducts([...products, updatedProduct]);
        toast.success('Товар успешно создан!');
      }

      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Произошла ошибка при сохранении.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const columns: ColumnDef<Product>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Название
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "category_id",
      header: ({ column }) => {
        return <div className="font-medium">Категория</div>;
      },
      cell: ({ row }) => {
        const category = categories.find(c => c.id === row.getValue("category_id"));
        return <div className="capitalize">{category?.name || '-'}</div>;
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      accessorKey: "base_price",
      header: () => <div className="text-right">Цена</div>,
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("base_price"));
        const formatted = new Intl.NumberFormat("ru-RU", {
          style: "currency",
          currency: "KZT",
        }).format(amount);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "status",
      header: "Статус",
      cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div>,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Открыть меню</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Действия</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                <Edit className="mr-2 h-4 w-4" /> Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDeleteDialog([product.id])}>
                <Trash2 className="mr-2 h-4 w-4" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [handleEditProduct, categories]);

  const table = useReactTable({
    data: products,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedRowsIds = Object.keys(table.getFilteredSelectedRowModel().rowsById);
  const statuses = useMemo(() => ['draft', 'published', 'archived'], []);
  
  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Управление товарами</h1>
        <div className="flex gap-2">
          {selectedRowsIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={() => openDeleteDialog(selectedRowsIds)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Удалить выбранные ({selectedRowsIds.length})
            </Button>
          )}
          <Button onClick={handleCreateNewProduct}>
            Создать товар
          </Button>
        </div>
      </div>
      
      <div className="w-full">
        <div className="flex items-center gap-4 py-4">
          <Input
            placeholder="Поиск по названию..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
          <Select
            onValueChange={(value) => table.getColumn('category_id')?.setFilterValue(value === 'all' ? undefined : value)}
            value={(table.getColumn('category_id')?.getFilterValue() as string) || 'all'}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) => table.getColumn('status')?.setFilterValue(value === 'all' ? undefined : value)}
            value={(table.getColumn('status')?.getFilterValue() as string) || 'all'}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по статусу" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все статусы</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Товаров не найдено.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="text-muted-foreground flex items-center justify-end py-4 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} из{" "}
          {table.getFilteredRowModel().rows.length} строк(и) выбрано.
        </div>
      </div>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent style={{ width: '95%', maxWidth: '800px' }}>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Редактировать товар' : 'Создать новый товар'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Измените данные товара и сохраните изменения.' : 'Заполните информацию о новом товаре.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct || undefined}
            categories={categories}
            brands={brands}
            collections={collections}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены, что хотите удалить?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все выбранные товары будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirmed} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500"
            >
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Продолжить удаление
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}