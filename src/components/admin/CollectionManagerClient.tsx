"use client";

import { useState, useMemo } from "react";
import { Collection, collectionService } from "@/lib/services/admin/collection";
import { Brand, Category } from "@/types/catalog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/enhanced-dialog";
import { CollectionForm } from "@/components/admin/CollectionForm";
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
  Image as ImageIcon,
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface CollectionManagerClientProps {
  initialCollections: Collection[];
  brands: Brand[];
  categories: Category[];
}

export function CollectionManagerClient({
  initialCollections,
  brands,
  categories,
}: CollectionManagerClientProps) {
  const [collections, setCollections] = useState(initialCollections);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [collectionIdsToDelete, setCollectionIdsToDelete] = useState<string[]>(
    [],
  );
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState({});

  // TODO: Реализовать проверку связей (products)
  async function canDeleteCollection(collectionId: string): Promise<boolean> {
    // Пример: запрос к supabase для проверки наличия товаров с этой коллекцией
    // const { data: products } = await supabase.from('products').select('id').eq('collection_id', collectionId).limit(1);
    // return !products || products.length === 0;
    return true; // Заглушка, реализовать позже
  }

  const handleCreateNewCollection = () => {
    setEditingCollection(null);
    setIsModalOpen(true);
  };

  const handleEditCollection = (collection: Collection) => {
    setEditingCollection(collection);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (collectionIds: string[]) => {
    // Фильтруем только валидные id
    const validIds = collectionIds.filter(
      (id) => typeof id === "string" && id.length > 0 && id !== "0",
    );
    setCollectionIdsToDelete(validIds);
    setIsAlertDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    setIsDeleting(true);
    try {
      let anyBlocked = false;
      let blockedCount = 0;
      for (const id of collectionIdsToDelete) {
        try {
          const canDelete = await canDeleteCollection(id);
          if (!canDelete) {
            anyBlocked = true;
            blockedCount++;
            continue;
          }
          await collectionService.deleteCollection(id);
        } catch (err) {
          anyBlocked = true;
          blockedCount++;
          // Логируем ошибку для отладки
          console.error("Ошибка при удалении коллекции", id, err);
          if (err && typeof err === "object" && Object.keys(err).length === 0) {
            toast.warning(
              `Возможная проблема при удалении коллекции (id: ${id}): пустая ошибка, но коллекция могла быть удалена.`,
            );
          }
        }
      }
      if (blockedCount > 0) {
        toast.error(
          `Не удалось удалить ${blockedCount} коллекц${blockedCount === 1 ? "ию" : blockedCount < 5 ? "ии" : "ий"} (есть связанные товары или ошибка).`,
        );
      }
      if (blockedCount < collectionIdsToDelete.length) {
        toast.success("Коллекции успешно удалены");
      }
      await fetchCollections();
    } catch (e) {
      console.error("Ошибка при массовом удалении коллекций", e);
      toast.error("Ошибка при удалении коллекций");
    } finally {
      setIsDeleting(false);
      setIsAlertDialogOpen(false);
      setCollectionIdsToDelete([]);
    }
  };

  async function fetchCollections() {
    const data = await collectionService.listCollections();
    setCollections(data);
  }

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingCollection) {
        await collectionService.updateCollection(editingCollection.id, data);
        toast.success("Коллекция обновлена");
      } else {
        await collectionService.createCollection(data);
        toast.success("Коллекция создана");
      }
      setIsModalOpen(false);
      setEditingCollection(null);
      await fetchCollections();
    } catch (e) {
      toast.error("Ошибка при сохранении коллекции");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<Collection>[] = useMemo(
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
        accessorKey: "brand_id",
        header: "Бренд",
        cell: ({ row }) => {
          const brand = brands.find((b) => b.id === row.getValue("brand_id"));
          return brand ? (
            <span className="inline-block px-2 py-0.5 rounded bg-muted text-xs">
              {brand.name}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          );
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "category_id",
        header: "Категория",
        cell: ({ row }) => {
          const category = categories.find(
            (c) => c.id === row.getValue("category_id"),
          );
          return category ? (
            <span className="inline-block px-2 py-0.5 rounded bg-muted text-xs">
              {category.name}
            </span>
          ) : (
            <span className="text-muted-foreground text-xs">—</span>
          );
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "image_url",
        header: "Изображение",
        cell: ({ row }) => {
          const url = row.getValue("image_url");
          if (typeof url === "string" && url.trim() !== "") {
            return (
              <img
                src={url}
                alt="preview"
                className="w-10 h-10 object-cover rounded"
              />
            );
          }
          return (
            <span className="text-muted-foreground">
              <ImageIcon className="w-5 h-5" />
            </span>
          );
        },
        enableSorting: false,
        enableHiding: true,
      },
      {
        accessorKey: "is_active",
        header: "Активна",
        cell: ({ row }) => (row.getValue("is_active") ? "Да" : "Нет"),
      },
      {
        accessorKey: "sort_order",
        header: "Порядок",
        cell: ({ row }) => row.getValue("sort_order"),
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const collection = row.original;
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
                <DropdownMenuItem
                  onClick={() => handleEditCollection(collection)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Редактировать
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => openDeleteDialog([collection.id])}
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
    [brands, categories],
  );

  const table = useReactTable({
    data: collections,
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

  // Вместо Object.keys(table.getFilteredSelectedRowModel().rowsById)
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedRowsIds = selectedRows
    .map((row) => row.original.id)
    .filter((id) => typeof id === "string" && id.length > 0 && id !== "0");

  return (
    <div>
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
          <Button onClick={handleCreateNewCollection}>Создать коллекцию</Button>
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
            onValueChange={(value) =>
              table
                .getColumn("brand_id")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
            value={
              (table.getColumn("brand_id")?.getFilterValue() as string) || "all"
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по бренду" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все бренды</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>
                    {brand.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Select
            onValueChange={(value) =>
              table
                .getColumn("category_id")
                ?.setFilterValue(value === "all" ? undefined : value)
            }
            value={
              (table.getColumn("category_id")?.getFilterValue() as string) ||
              "all"
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Фильтр по категории" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">Все категории</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
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
                    Коллекции не найдены.
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
        <DialogContent size="lg" scrollable>
          <DialogHeader>
            <DialogTitle>
              {editingCollection
                ? "Редактировать коллекцию"
                : "Создать новую коллекцию"}
            </DialogTitle>
            <DialogDescription>
              {editingCollection
                ? "Измените данные коллекции и сохраните изменения."
                : "Заполните информацию о новой коллекции."}
            </DialogDescription>
          </DialogHeader>
          <CollectionForm
            initialData={editingCollection || undefined}
            brands={brands}
            categories={categories}
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
              Это действие нельзя отменить. Все выбранные коллекции будут
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
