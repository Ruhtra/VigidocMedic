"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Activity, Clock, LogOut, Loader2, Info } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { signOut, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

const pulseGlow: Variants = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.6, 0.3],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
  },
};

export default function PendingPage() {
  const { theme } = useTheme();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Redireciona automaticamente se o status mudar para ativo
  useEffect(() => {
    if (!isPending && session?.user?.status === "ACTIVE") {
      const role = session.user.role as string;
      router.push(DEFAULT_LOGIN_REDIRECT[role] || "/user");
    }
  }, [session, isPending, router]);

  async function handleLogout() {
    setIsLoggingOut(true);
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  }

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 transition-colors duration-500">
      {/* Elementos de fundo dinâmicos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 dark:bg-teal-500/5 blur-3xl mix-blend-multiply dark:mix-blend-screen" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-lg"
      >
        <div className="rounded-3xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <motion.div variants={itemVariants} className="p-8 pb-0 text-center">
            <div className="relative mx-auto w-20 h-20 mb-6 flex justify-center items-center">
              <motion.div
                variants={pulseGlow}
                animate="animate"
                className="absolute inset-0 rounded-full bg-amber-400/20"
              />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-orange-400 p-[2px] shadow-lg">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
              Acesso em Análise
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg mx-auto max-w-sm">
              Sua conta foi criada com sucesso, mas precisa de autorização.
            </p>
          </motion.div>

          {/* Conteúdo Informativo */}
          <motion.div variants={itemVariants} className="p-8 pt-6">
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-5 mb-8 flex gap-4 text-left">
              <Info className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                  Revisão Administrador
                </h3>
                <p className="text-sm text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                  Para garantir a segurança da plataforma, validamos o perfil de
                  novos{" "}
                  {session?.user?.role === "doctor" ||
                  session?.user?.role === "medico"
                    ? "médicos e profissionais da saúde"
                    : "pacientes"}{" "}
                  manualmente. Por favor, aguarde enquanto um administrador
                  revisa sua solicitação.
                </p>
              </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3">
              <button
                disabled
                className="w-full relative h-12 rounded-xl font-medium text-white bg-slate-300 dark:bg-slate-800 cursor-not-allowed overflow-hidden group transition-all"
              >
                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.1),transparent)] -translate-x-[100%] opacity-0" />
                <span className="flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4 opacity-50" />
                  Ir para Plataforma (Bloqueado)
                </span>
              </button>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    Sair da Conta
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6 flex items-center justify-center gap-2">
          VigiDoc &copy; {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}
