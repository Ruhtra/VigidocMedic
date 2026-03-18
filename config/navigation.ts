import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileText,
  Settings,
  User,
  LogOut,
  ScanLine,
} from "lucide-react";
import React from "react";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "patients", label: "Pacientes", href: "/patients", icon: Users },
  { id: "triage", label: "Triagem", href: "/triagem", icon: ShieldAlert },
  { id: "reports", label: "Relatórios", href: "/relatorios", icon: FileText },
];

export const MOBILE_BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { id: "patients", label: "Pacientes", href: "/patients", icon: Users },
  // Scan FAB is handled separately in the UI
  { id: "triage", label: "Triagem", href: "/triagem", icon: ShieldAlert },
  { id: "menu", label: "Menu", href: "#", icon: ScanLine }, // Placeholder for menu trigger
];

export const USER_NAV_ITEMS: NavItem[] = [
  { id: "profile", label: "Perfil", href: "/profile", icon: User },
  { id: "settings", label: "Configurações", href: "/settings", icon: Settings },
  { id: "logout", label: "Sair", href: "/logout", icon: LogOut },
];

export const APP_ROUTES = {
  DASHBOARD: "/admin",
  PATIENTS: "/patients",
  TRIAGE: "/triagem",
  REPORTS: "/relatorios",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  LOGOUT: "/logout",
  SCAN: "/scan",
};
