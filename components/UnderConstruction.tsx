"use client";

import React from "react";
import { motion } from "framer-motion";
import { Construction, ArrowLeft, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface UnderConstructionProps {
  title: string;
  description?: string;
}

export default function UnderConstruction({
  title,
  description = "Estamos trabalhando duro para trazer essa funcionalidade para você em breve. Fique atento!",
}: UnderConstructionProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.5,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <div className="relative bg-background border border-border p-6 rounded-3xl shadow-2xl">
          <Construction className="h-16 w-16 text-primary animate-pulse" />
        </div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-muted-foreground max-w-md mb-10 leading-relaxed"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <button
          onClick={() => router.back()}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium",
            "bg-muted text-foreground hover:bg-muted/80 transition-all active:scale-95 cursor-pointer"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          onClick={() => router.push("/admin")}
          className={cn(
            "flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium",
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all active:scale-95 cursor-pointer"
          )}
        >
          <Home className="h-4 w-4" />
          Ir para Dashboard
        </button>
      </motion.div>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}
