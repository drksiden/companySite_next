"use client";

import { FC, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { services } from "@/data/services";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
};

const ServiceAccordionList: FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="max-w-4xl mx-auto my-12 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {services.map((service, idx) => {
          const isOpen = openIndex === idx;
          const Icon = service.icon;
          return (
            <motion.div
              key={service.id}
              variants={itemVariants}
              className={`group relative bg-gradient-to-br from-white/95 to-white/80 dark:from-gray-900/95 dark:to-gray-800/80 rounded-2xl shadow-lg hover:shadow-2xl border border-blue-100/50 dark:border-blue-800/50 overflow-hidden transition-all duration-300 backdrop-blur-sm
                ${isOpen ? "ring-2 ring-blue-400 dark:ring-blue-500 shadow-xl" : "hover:border-blue-200 dark:hover:border-blue-700"}
              `}
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none" />
              
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative w-full flex items-center justify-between px-6 py-6 text-left focus:outline-none transition-colors duration-300
                  ${isOpen ? "bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-blue-900/30 dark:to-purple-900/20" : "hover:bg-blue-50/40 dark:hover:bg-blue-900/10"}
                `}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                aria-expanded={isOpen}
                aria-controls={`service-details-${service.id}`}
              >
                <div className="flex items-center gap-4">
                  <motion.span
                    whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 w-14 h-14 shadow-lg shadow-blue-500/30"
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </motion.span>
                  <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ChevronDown className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                </motion.div>
              </motion.button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`service-details-${service.id}`}
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { 
                        height: "auto", 
                        opacity: 1,
                        transition: {
                          height: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const },
                          opacity: { duration: 0.3, delay: 0.1 }
                        }
                      },
                      collapsed: { 
                        height: 0, 
                        opacity: 0,
                        transition: {
                          height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as const },
                          opacity: { duration: 0.2 }
                        }
                      },
                    }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-2 border-t border-blue-100/50 dark:border-blue-800/50">
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-base text-gray-800 dark:text-gray-200 mb-3 font-semibold"
                      >
                        {service.summary}
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                      >
                        {service.details}
                      </motion.div>
                      {service.subcategories && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="mt-4 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-100/50 dark:border-blue-800/50"
                        >
                          <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-3 tracking-wider">
                            Направления:
                          </h4>
                          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {service.subcategories.map((sub, subIdx) => (
                              <motion.li
                                key={subIdx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + subIdx * 0.05 }}
                                className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2 font-medium"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                                {sub}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
};

export default ServiceAccordionList;
