"use client";

import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Row } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions?: Array<{
    label: string;
    onClick: (row: TData) => void;
    icon?: React.ComponentType<{ className?: string }>;
    shortcut?: string;
    variant?: "default" | "destructive";
  }>;
  statusActions?: Array<{
    label: string;
    value: string;
    onSelect: (row: TData, value: string) => void;
  }>;
}

export function DataTableRowActions<TData>({
  row,
  actions = [],
  statusActions = [],
}: DataTableRowActionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Открыть меню</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={index}
            onClick={() => action.onClick(row.original)}
            className={action.variant === "destructive" ? "text-destructive" : ""}
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4" />}
            {action.label}
            {action.shortcut && (
              <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
            )}
          </DropdownMenuItem>
        ))}

        {statusActions.length > 0 && actions.length > 0 && (
          <DropdownMenuSeparator />
        )}

        {statusActions.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Изменить статус</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup>
                {statusActions.map((statusAction, index) => (
                  <DropdownMenuRadioItem
                    key={index}
                    value={statusAction.value}
                    onClick={() => statusAction.onSelect(row.original, statusAction.value)}
                  >
                    {statusAction.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
