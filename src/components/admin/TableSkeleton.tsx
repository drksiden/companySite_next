"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showImage?: boolean;
  showActions?: boolean;
}

export function TableSkeleton({
  rows = 5,
  columns = 5,
  showImage = false,
  showActions = true,
}: TableSkeletonProps) {
  const totalColumns = columns + (showImage ? 1 : 0) + (showActions ? 1 : 0);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {showImage && <TableHead className="w-16"></TableHead>}
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-24" />
              </TableHead>
            ))}
            {showActions && (
              <TableHead className="w-16">
                <Skeleton className="h-4 w-16" />
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {showImage && (
                <TableCell>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </TableCell>
              )}
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full max-w-[200px]" />
                </TableCell>
              ))}
              {showActions && (
                <TableCell>
                  <Skeleton className="h-8 w-8 rounded" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

