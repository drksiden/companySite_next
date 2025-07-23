"use client";

import { useState, useMemo } from 'react';
import { Brand, brandService } from '@/lib/services/brand';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BrandForm } from '@/components/admin/BrandForm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Loader2, Edit, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, ColumnFiltersState } from '@tanstack/react-table';

interface BrandManagerClientProps {
  initialBrands: Brand[];
}

export function BrandManagerClient({ initialBrands }: BrandManagerClientProps) {
  const [brands, setBrands] = useState(initialBrands);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [brandIdsToDelete, setBrandIdsToDelete] = useState<string[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // TODO: Реализовать проверку привязок (products, collections)
  async function canDeleteBrand(brandId: string): Promise<boolean> {
    // Пример: запрос к supabase для проверки наличия товаров с этим брендом
    // const { data: products } = await supabase.from('products').select('id').eq('brand_id', brandId).limit(1);
    // return !products || products.length === 0;
    return true; // Заглушка, реализовать позже
  }

  const handleCreateNewBrand = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (brandIds: string[]) => {
    setBrandIdsToDelete(brandIds);
    setIsAlertDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      let anyBlocked = false;
      for (const id of brandIdsToDelete) {
        const canDelete = await canDeleteBrand(id);
        if (!canDelete) {
          anyBlocked = true;
          toast.error('Нельзя удалить бренд: есть связанные товары или коллекции');
          continue;
        }
        await brandService.deleteBrand(id);
      }
      if (!anyBlocked) toast.success('Бренды успешно удалены');
      await fetchBrands();
    } catch (e) {
      toast.error('Ошибка при удалении бренда');
    } finally {
      setIsDeleting(false);
      setIsAlertDialogOpen(false);
      setBrandIdsToDelete([]);
    }
  };

  async function fetchBrands() {
    const data = await brandService.listBrands();
    setBrands(data);
  }

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingBrand) {
        await brandService.updateBrand(editingBrand.id, data);
        toast.success('Бренд обновлён');
      } else {
        await brandService.createBrand(data);
        toast.success('Бренд создан');
      }
      setIsModalOpen(false);
      setEditingBrand(null);
      await fetchBrands();
    } catch (e) {
      toast.error('Ошибка при сохранении бренда');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Brand>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
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
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>Название<ArrowUpDown className="ml-2 h-4 w-4" /></Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => <div>{row.getValue("slug")}</div>,
    },
    {
      accessorKey: "country",
      header: "Страна",
      cell: ({ row }) => <div>{row.getValue("country")}</div>,
    },
    {
      accessorKey: "is_active",
      header: "Активен",
      cell: ({ row }) => row.getValue("is_active") ? 'Да' : 'Нет',
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const brand = row.original;
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
              <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                <Edit className="mr-2 h-4 w-4" /> Редактировать
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => openDeleteDialog([brand.id])} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Удалить
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  const table = useReactTable({
    data: brands,
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 sm:mb-0">Бренды</h1>
        <div className="flex gap-2">
          {selectedRowsIds.length > 0 && (
            <Button variant="destructive" onClick={() => openDeleteDialog(selectedRowsIds)} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Удалить выбранные ({selectedRowsIds.length})
            </Button>
          )}
          <Button onClick={handleCreateNewBrand}>Создать бренд</Button>
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center gap-4 py-4">
          <Input
            placeholder="Поиск по названию..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Бренды не найдены.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="text-muted-foreground flex items-center justify-end py-4 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} из {table.getFilteredRowModel().rows.length} строк(и) выбрано.
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent style={{ width: '95%', maxWidth: '600px' }}>
          <DialogHeader>
            <DialogTitle>{editingBrand ? 'Редактировать бренд' : 'Создать новый бренд'}</DialogTitle>
            <DialogDescription>
              {editingBrand ? 'Измените данные бренда и сохраните изменения.' : 'Заполните информацию о новом бренде.'}
            </DialogDescription>
          </DialogHeader>
          <BrandForm
            initialData={editingBrand || undefined}
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
              Это действие нельзя отменить. Все выбранные бренды будут безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed} disabled={isDeleting} className="bg-red-600 hover:bg-red-500">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Продолжить удаление
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 