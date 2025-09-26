import { Card } from "@/components/ui/card";

export default function LoadingSkeletons() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, index) => (
        <Card
          key={index}
          className="bg-card border border-border shadow-sm rounded-xl overflow-hidden catalog-animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="relative w-full h-72 bg-muted loading-shimmer"></div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-muted loading-shimmer rounded w-1/3"></div>
            <div className="h-6 bg-muted loading-shimmer rounded w-2/3"></div>
            <div className="h-4 bg-muted loading-shimmer rounded w-1/2"></div>
            <div className="flex items-center justify-between">
              <div className="h-6 bg-muted loading-shimmer rounded w-1/4"></div>
              <div className="h-4 bg-muted loading-shimmer rounded w-1/5"></div>
            </div>
            <div className="h-4 bg-muted loading-shimmer rounded w-1/3"></div>
          </div>
        </Card>
      ))}
    </div>
  );
}
