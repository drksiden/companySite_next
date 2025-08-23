"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COMPANY_NAME } from "@/data/constants";

export function Hero() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section
      id="hero"
      className="relative text-center py-28 md:py-40 px-4 w-full overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600"
    >
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-5 leading-tight text-white ${
            isMounted ? "animate-fade-in" : ""
          }`}
        >
          {COMPANY_NAME}
        </h1>
        <p
          className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90 ${
            isMounted ? "animate-fade-in" : ""
          }`}
          style={isMounted ? { animationDelay: "300ms" } : {}}
        >
          Профессиональный подход, разумное решение
        </p>
        <div
          className={`${isMounted ? "animate-fade-in" : ""}`}
          style={isMounted ? { animationDelay: "600ms" } : {}}
        >
          <Button
            asChild
            size="lg"
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-full px-6 py-3 transition-colors duration-300 hover:scale-105 active:scale-95 transform"
          >
            <Link href="/contact">Получить консультацию</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
