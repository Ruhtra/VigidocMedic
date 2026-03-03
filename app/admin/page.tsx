"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileText,
  ScanLine,
  User,
  Settings,
} from "lucide-react";
import {
  ThemeProvider,
  NavigationProvider,
  useNavigation,
} from "@/lib/contexts";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

/* ==========================================================================
   PAGE PLACEHOLDER MAP
   ========================================================================== */

const PAGE_META: Record<
  string,
  { label: string; icon: React.ElementType; description: string }
> = {
  dashboard: {
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Visão geral de métricas e indicadores de saúde.",
  },
  patients: {
    label: "Pacientes",
    icon: Users,
    description: "Lista de pacientes e fichas individuais.",
  },
  triage: {
    label: "Triagem",
    icon: ShieldAlert,
    description: "Fila de prioridade e alertas de triagem.",
  },
  reports: {
    label: "Relatórios",
    icon: FileText,
    description: "Relatórios e análises de dados.",
  },
  scan: {
    label: "Scan",
    icon: ScanLine,
    description: "Leitor de QR Code para identificação rápida.",
  },
  profile: {
    label: "Perfil",
    icon: User,
    description: "Informações do perfil do usuário.",
  },
  settings: {
    label: "Configurações",
    icon: Settings,
    description: "Preferências e configurações do sistema.",
  },
};

/**
 * AdminContent reads the sidebar state from localStorage to sync
 * the margin-left offset with Navbar's sidebar toggle.
 */
function AdminContent() {
  const { currentPage } = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Listen for changes to the sidebar state (via localStorage) */
  useEffect(() => {
    const checkSidebar = () => {
      setSidebarOpen(localStorage.getItem("vigidoc-sidebar") === "open");
    };
    checkSidebar();

    // Listen for storage changes from same-tab (custom event)
    const handleStorage = () => checkSidebar();
    window.addEventListener("storage", handleStorage);

    // Poll every 200ms as a fallback for same-tab localStorage writes
    const interval = setInterval(checkSidebar, 200);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  const meta = PAGE_META[currentPage] ?? {
    label: currentPage,
    icon: LayoutDashboard,
    description: "Página não encontrada.",
  };
  const Icon = meta.icon;

  return (
    <main
      className={cn(
        "min-h-screen transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "pt-16 lg:pt-20",
        "pb-24 lg:pb-6", // extra mobile bottom padding for raised nav
        "px-4 sm:px-6 lg:px-8",
        sidebarOpen ? "lg:ml-64" : "lg:ml-0",
      )}
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">{meta.label}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-md">
            {meta.description}
          </p>
          <span className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Em desenvolvimento
          </span>
        </div>
      </div>
    </main>
  );
}

export default function AdminPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider>
      <NavigationProvider defaultPage="dashboard">
        <Navbar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <AdminContent />
      </NavigationProvider>
    </ThemeProvider>
  );
}
