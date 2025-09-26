import { Loader2 } from "lucide-react";

interface SimpleLoadingIndicatorProps {
  message?: string;
}

export default function SimpleLoadingIndicator({
  message = "Загрузка товаров..."
}: SimpleLoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 space-y-4">
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary/20"></div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-foreground">
          {message}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Пожалуйста, подождите...
        </p>
      </div>

      {/* Pulse animation dots */}
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="w-2 h-2 bg-primary rounded-full animate-pulse"
            style={{
              animationDelay: `${index * 0.2}s`,
              animationDuration: '1s'
            }}
          />
        ))}
      </div>
    </div>
  );
}
