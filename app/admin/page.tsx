"use client";

import { useState } from "react";
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
   Placeholder views for each currentPage until real pages are built.
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

function AdminContent() {
  const { currentPage } = useNavigation();

  const meta = PAGE_META[currentPage] ?? {
    label: currentPage,
    icon: LayoutDashboard,
    description: "Página não encontrada.",
  };
  const Icon = meta.icon;

  return (
    <main
      className={cn(
        "min-h-screen",
        "pt-16 lg:pt-20", // offset for fixed top bar
        "pb-20 lg:pb-6", // offset for fixed bottom nav on mobile
        "px-4 sm:px-6 lg:px-8",
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
