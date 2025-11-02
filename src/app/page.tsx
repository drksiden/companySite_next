import { HomeClient } from "./HomeClient";
import { Suspense } from "react";
import { News } from "@/components/News";
import { NewsLoadingFallback } from "@/components/NewsLoadingFallback";

export default function ServerHomePage() {
  return (
    <HomeClient
      newsSlot={
        <Suspense fallback={<NewsLoadingFallback />}>
          <News />
        </Suspense>
      }
    />
  );
}