"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SearchX, Package, RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  onClearFilters: () => void;
}

export default function EmptyState({
  title,
  description,
  onClearFilters,
}: EmptyStateProps) {
  return (
    <Card className="w-full">
      <CardContent className="flex flex-col items-center justify-center py-16 px-8">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>

        <h2 className="text-2xl font-semibold text-center mb-2">{title}</h2>

        <p className="text-muted-foreground text-center mb-6 max-w-md">
          {description}
        </p>

        <Button asChild>
          <a href="/">На главную</a>
        </Button>
      </CardContent>
    </Card>
  );
}
