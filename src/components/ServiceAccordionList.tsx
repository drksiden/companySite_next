"use client";

import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { services } from "@/data/services";

const ServiceAccordionList: FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-3xl mx-auto my-12 px-4">
      <div className="space-y-5">
        {services.map((service, idx) => {
          const isOpen = openIndex === idx;
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className={`bg-white/90 dark:bg-gray-900/90 rounded-2xl shadow-lg border border-blue-100 dark:border-blue-800 overflow-hidden transition
                ${isOpen ? "ring-2 ring-blue-400 dark:ring-blue-500" : ""}
              `}
            >
              <button
                className={`w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none group transition
                  ${isOpen ? "bg-blue-50 dark:bg-blue-900/30" : "hover:bg-blue-50/60 dark:hover:bg-blue-900/20"}
                `}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`service-details-${service.id}`}
              >
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/40 w-12 h-12 shadow-sm">
                    <Icon className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </span>
                  <span className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                    {service.title}
                  </span>
                </div>
                <ChevronDown
                  className={`w-6 h-6 ml-4 text-blue-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`service-details-${service.id}`}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { height: "auto", opacity: 1 },
                      collapsed: { height: 0, opacity: 0 },
                    }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="overflow-hidden px-6"
                  >
                    <div className="py-4 border-t border-blue-100 dark:border-blue-800">
                      <div className="text-base text-gray-800 dark:text-gray-200 mb-2 font-medium">
                        {service.summary}
                      </div>
                      <div className="text-sm">{service.details}</div>
                      {service.subcategories && (
                        <div className="mt-4">
                          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            Направления:
                          </h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            {service.subcategories.map((sub, idx) => (
                              <li key={idx}>• {sub}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ServiceAccordionList;
