import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search } from "@/components/icons/SimpleIcons";

export default function CatalogNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl text-foreground">
              Категория не найдена
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              К сожалению, запрашиваемая категория не найдена или была удалена.
            </p>

            <div className="flex flex-col gap-3 pt-4">
              <Button asChild>
                <Link href="/catalog">
                  <Search className="h-4 w-4 mr-2" />
                  Перейти в каталог
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  На главную
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
