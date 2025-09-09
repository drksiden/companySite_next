import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Home, ArrowLeft } from "@/components/icons/SimpleIcons";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <Card>
          <CardContent className="p-8">
            <div className="text-6xl font-bold text-primary mb-4">404</div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Страница не найдена
            </h1>
            <p className="text-muted-foreground mb-6">
              Запрашиваемая страница не существует или была перемещена.
            </p>

            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Главная страница
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/catalog">
                  <Search className="h-4 w-4 mr-2" />
                  Каталог товаров
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
