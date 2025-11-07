"use client";

import { useMemo, useState } from "react";
import { Brand } from "@/lib/services/admin/brand";
import {
  useBrandsQuery,
  useCreateBrand,
  useUpdateBrand,
  useDeleteBrand,
} from "@/lib/hooks/useBrandsQuery";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/enhanced-dialog";
import { BrandForm } from "@/components/admin/BrandForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Trash2,
  Loader2,
  Edit,
  ArrowUpDown,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnFiltersState,
} from "@tanstack/react-table";

export function BrandManagerClient() {
  // Получение брендов через кэш-хук
  const { data: brands = [], isLoading, error } = useBrandsQuery();

  // Мутации
  const createBrandMutation = useCreateBrand();
  const updateBrandMutation = useUpdateBrand();
  const deleteBrandMutation = useDeleteBrand();

  // Все локальные UI состояния
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [brandIdsToDelete, setBrandIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // Моки проверки связанных товаров/коллекций (оставить как у тебя)
  async function canDeleteBrand(brandId: string): Promise<boolean> {
    return true;
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
          toast.error("Нельзя удалить бренд: есть связанные товары или коллекции");
          continue;
        }
        await deleteBrandMutation.mutateAsync(id);
      }
      if (!anyBlocked) toast.success("Бренды успешно удалены");
    } catch (e) {
      toast.error("Ошибка при удалении бренда");
    } finally {
      setIsDeleting(false);
      setIsAlertDialogOpen(false);
      setBrandIdsToDelete([]);
    }
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingBrand) {
        await updateBrandMutation.mutateAsync({ id: editingBrand.id, brand: data });
        toast.success("Бренд обновлён");
      } else {
        await createBrandMutation.mutateAsync(data);
        toast.success("Бренд создан");
      }
      setIsModalOpen(false);
      setEditingBrand(null);
    } catch (e) {
      toast.error("Ошибка при сохранении бренда");
    }
  };

  const columns: ColumnDef<Brand>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
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
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Название
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <div className="font-medium">{row.getValue("name")}</div>
        ),
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
        cell: ({ row }) => (row.getValue("is_active") ? "Да" : "Нет"),
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
                <DropdownMenuItem
                  onClick={() => openDeleteDialog([brand.id])}
                  className="text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

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

  const selectedRowsIds = Object.keys(
    table.getFilteredSelectedRowModel().rowsById,
  );

  return (
    <div>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 mr-2 animate-spin" />
          Загрузка брендов...
        </div>
      ) : error ? (
        <div className="text-destructive text-center">{String(error)}</div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
            <div className="flex gap-2">
              {selectedRowsIds.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => openDeleteDialog(selectedRowsIds)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
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
                onChange={(event) =>
                  table.getColumn("name")?.setFilterValue(event.target.value)
                }
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
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      ))}
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
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
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
                        Бренды не найдены.
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
        </>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent size="lg" scrollable>
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? "Редактировать бренд" : "Создать новый бренд"}
            </DialogTitle>
            <DialogDescription>
              {editingBrand
                ? "Измените данные бренда и сохраните изменения."
                : "Заполните информацию о новом бренде."}
            </DialogDescription>
          </DialogHeader>
          <BrandForm
            initialData={editingBrand || undefined}
            onSubmit={handleFormSubmit}
            isSubmitting={createBrandMutation.isPending || updateBrandMutation.isPending}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Вы уверены, что хотите удалить?</AlertDialogTitle>
            <AlertDialogDescription>
              Это действие нельзя отменить. Все выбранные бренды будут
              безвозвратно удалены.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-500"
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Продолжить удаление
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
