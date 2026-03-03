"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileText,
  ScanLine,
  Bell,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Activity,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeContext, useNavigation } from "@/lib/contexts";

/* ==========================================================================
   TYPES
   ========================================================================== */

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

/* ==========================================================================
   CONSTANTS
   ========================================================================== */

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "patients", label: "Pacientes", icon: Users },
  { id: "triage", label: "Triagem", icon: ShieldAlert },
  { id: "reports", label: "Relatórios", icon: FileText },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "patients", label: "Pacientes", icon: Users },
  // scan FAB is inserted in the middle manually
  { id: "triage", label: "Triagem", icon: ShieldAlert },
  { id: "menu", label: "Menu", icon: Menu },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Alerta de Paciente",
    description: "João Silva apresentou alteração nos sinais vitais.",
    time: "2 min atrás",
    unread: true,
  },
  {
    id: 2,
    title: "Nova Triagem",
    description: "Maria Souza adicionada à fila de prioridade.",
    time: "15 min atrás",
    unread: true,
  },
  {
    id: 3,
    title: "Relatório Pronto",
    description: "O relatório semanal de internações está disponível.",
    time: "1h atrás",
    unread: false,
  },
];

/* ==========================================================================
   ANIMATION VARIANTS
   ========================================================================== */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
};

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

/* ==========================================================================
   NAVBAR COMPONENT
   ========================================================================== */

export default function Navbar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: NavbarProps) {
  const { theme, toggle } = useThemeContext();
  const { currentPage, setCurrentPage } = useNavigation();

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Desktop sidebar state — persisted in localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-hide top bar on mobile scroll
  const [topBarVisible, setTopBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Refs for click-outside closing
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  /* ---- Restore sidebar preference from localStorage ---- */
  useEffect(() => {
    const stored = localStorage.getItem("vigidoc-sidebar");
    if (stored === "open") setIsSidebarOpen(true);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => {
      const next = !prev;
      localStorage.setItem("vigidoc-sidebar", next ? "open" : "closed");
      return next;
    });
  }, []);

  /* ---- Auto-hide logic (mobile only, < 1024px) ---- */
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 1024) {
        setTopBarVisible(true);
        return;
      }
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 60) {
        setTopBarVisible(false);
      } else {
        setTopBarVisible(true);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ---- Close dropdowns on outside click ---- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---- Navigation handler ---- */
  const navigateTo = useCallback(
    (page: string) => {
      setCurrentPage(page);
      setIsMobileMenuOpen(false);
      setIsNotifOpen(false);
      setIsProfileOpen(false);
    },
    [setCurrentPage, setIsMobileMenuOpen],
  );

  /* ======================================================================
     RENDER
     ====================================================================== */
  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP TOP NAVBAR  (visible only on lg+)
          ────────────────────────────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden lg:flex items-center justify-between",
          "h-16 px-6",
          "bg-background/80 backdrop-blur-xl",
          "border-b border-border",
          "transition-colors duration-300",
        )}
      >
        {/* Left: sidebar toggle + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className={cn(
              "p-2 rounded-lg cursor-pointer",
              "text-muted-foreground hover:text-foreground hover:bg-muted",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            )}
            aria-label={
              isSidebarOpen ? "Recolher menu lateral" : "Expandir menu lateral"
            }
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground tracking-tight">
              Vigi<span className="text-primary">Doc</span>
            </span>
          </div>
        </div>

        {/* Center nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                  "transition-all duration-200 cursor-pointer",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setIsNotifOpen((v) => !v);
                setIsProfileOpen(false);
              }}
              className={cn(
                "relative p-2 rounded-lg cursor-pointer",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              )}
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {isNotifOpen && <NotificationDropdown />}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setIsProfileOpen((v) => !v);
                setIsNotifOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 p-1.5 pr-3 rounded-lg cursor-pointer",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              )}
              aria-label="Menu do perfil"
            >
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground hidden xl:inline">
                Dr. Admin
              </span>
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <ProfileDropdown
                  theme={theme}
                  toggle={toggle}
                  navigateTo={navigateTo}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────
          DESKTOP SIDEBAR  (visible only on lg+ when toggled open)
          ────────────────────────────────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed top-16 left-0 bottom-0 z-40 hidden lg:flex flex-col",
          "bg-background/95 backdrop-blur-xl border-r border-border",
          "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "overflow-hidden",
          isSidebarOpen ? "w-64" : "w-0",
        )}
      >
        <div className="flex flex-col flex-1 w-64 overflow-y-auto">
          {/* Nav section */}
          <div className="px-3 py-4">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Navegação
            </p>
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
              {/* Scan link */}
              <button
                onClick={() => navigateTo("scan")}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  currentPage === "scan"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <ScanLine className="h-4 w-4" />
                Scan
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-3 border-t border-border" />

          {/* Account section */}
          <div className="px-3 py-4">
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Conta
            </p>
            <div className="space-y-1">
              <SidebarItem
                icon={User}
                label="Perfil"
                onClick={() => navigateTo("profile")}
              />
              <SidebarItem
                icon={Settings}
                label="Configurações"
                onClick={() => navigateTo("settings")}
              />
              <button
                onClick={toggle}
                className={cn(
                  "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                  "text-muted-foreground hover:bg-muted hover:text-foreground",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                )}
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
              </button>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Logout at the bottom */}
          <div className="px-3 py-4 border-t border-border">
            <SidebarItem
              icon={LogOut}
              label="Sair"
              onClick={() => {
                /* logout placeholder */
              }}
              danger
            />
          </div>
        </div>
      </aside>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE TOP BAR  (visible only on < lg, auto-hides on scroll)
          ────────────────────────────────────────────────────────────────── */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 flex lg:hidden items-center justify-between",
          "h-14 px-4",
          "bg-background/80 backdrop-blur-xl",
          "border-b border-border",
          "transition-all duration-300",
          topBarVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0",
        )}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="text-base font-bold text-foreground tracking-tight">
            Vigi<span className="text-primary">Doc</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div ref={notifRef} className="relative">
            <button
              onClick={() => {
                setIsNotifOpen((v) => !v);
                setIsProfileOpen(false);
              }}
              className={cn(
                "relative p-2 rounded-lg cursor-pointer",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              )}
              aria-label="Notificações"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {isNotifOpen && <NotificationDropdown />}
            </AnimatePresence>
          </div>

          <div ref={profileRef} className="relative">
            <button
              onClick={() => {
                setIsProfileOpen((v) => !v);
                setIsNotifOpen(false);
              }}
              className={cn(
                "p-1.5 rounded-lg cursor-pointer",
                "text-muted-foreground hover:text-foreground hover:bg-muted",
                "transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              )}
              aria-label="Menu do perfil"
            >
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            </button>
            <AnimatePresence>
              {isProfileOpen && (
                <ProfileDropdown
                  theme={theme}
                  toggle={toggle}
                  navigateTo={navigateTo}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE BOTTOM NAVIGATION  (improved layout)
          - Taller bar with safe-area padding for phones with gesture bars
          - Centered icons with clearer active state (pill background)
          - Better spacing and alignment
          ────────────────────────────────────────────────────────────────── */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex lg:hidden",
          "bg-background/95 backdrop-blur-xl",
          "border-t border-border",
          "transition-colors duration-300",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
      >
        <div className="flex items-center justify-around w-full px-4 pt-2 pb-2">
          {BOTTOM_NAV_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const isMenu = item.id === "menu";

            return (
              <React.Fragment key={item.id}>
                {/* Insert FAB scan button before the 3rd item (index 2) */}
                {index === 2 && (
                  <button
                    onClick={() => navigateTo("scan")}
                    className={cn(
                      "relative -top-5 flex items-center justify-center",
                      "h-14 w-14 rounded-full cursor-pointer",
                      "bg-gradient-to-br from-teal-500 to-emerald-500",
                      "shadow-lg shadow-teal-500/30",
                      "text-white",
                      "transition-all duration-200",
                      "hover:shadow-xl hover:shadow-teal-500/40 hover:scale-105",
                      "active:scale-95",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                      currentPage === "scan" &&
                        "ring-2 ring-primary/50 ring-offset-2 ring-offset-background",
                    )}
                    aria-label="Scan"
                  >
                    <ScanLine className="h-6 w-6" />
                  </button>
                )}

                <button
                  onClick={() =>
                    isMenu ? setIsMobileMenuOpen(true) : navigateTo(item.id)
                  }
                  className={cn(
                    "relative flex flex-col items-center justify-center",
                    "min-w-[56px] py-1.5 px-2 rounded-xl cursor-pointer",
                    "transition-all duration-200",
                    "focus-visible:outline-none",
                    /* Active state: pill background + primary color */
                    isActive && !isMenu
                      ? "bg-primary/12 text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  aria-label={item.label}
                >
                  <Icon
                    className={cn(
                      "h-[22px] w-[22px] mb-1 transition-all duration-200",
                      isActive && !isMenu
                        ? "text-primary scale-110"
                        : "text-inherit",
                    )}
                    strokeWidth={isActive && !isMenu ? 2.5 : 2}
                  />
                  <span
                    className={cn(
                      "text-[10px] leading-tight transition-all duration-200",
                      isActive && !isMenu
                        ? "font-bold text-primary"
                        : "font-medium",
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active bar indicator — visible line above icon */}
                  {isActive && !isMenu && (
                    <motion.span
                      layoutId="mobile-active-indicator"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 h-[3px] w-8 rounded-full bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </nav>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE DRAWER  (slides in from right)
          ────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              key="drawer-overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm lg:hidden"
              aria-hidden="true"
            />

            <motion.aside
              key="drawer-panel"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={cn(
                "fixed top-0 right-0 bottom-0 z-[70] w-72 lg:hidden",
                "bg-background border-l border-border",
                "flex flex-col",
                "shadow-2xl",
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Dr. Admin
                    </p>
                    <p className="text-xs text-muted-foreground">
                      admin@vigidoc.com
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "p-2 rounded-lg cursor-pointer",
                    "text-muted-foreground hover:text-foreground hover:bg-muted",
                    "transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  )}
                  aria-label="Fechar menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Primary nav links */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Navegação
                </p>
                <div className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                          "transition-all duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => navigateTo("scan")}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                      currentPage === "scan"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <ScanLine className="h-4 w-4" />
                    Scan
                  </button>
                </div>

                <div className="my-4 border-t border-border" />

                <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Conta
                </p>
                <div className="space-y-1">
                  <DrawerItem
                    icon={User}
                    label="Perfil"
                    onClick={() => navigateTo("profile")}
                  />
                  <DrawerItem
                    icon={Settings}
                    label="Configurações"
                    onClick={() => navigateTo("settings")}
                  />
                  <button
                    onClick={toggle}
                    className={cn(
                      "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
                      "text-muted-foreground hover:bg-muted hover:text-foreground",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                    )}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                  </button>

                  <div className="my-2 border-t border-border" />

                  <DrawerItem
                    icon={LogOut}
                    label="Sair"
                    onClick={() => {
                      /* logout placeholder */
                    }}
                    danger
                  />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ==========================================================================
   Utility: export sidebar state for layout offset in parent
   ========================================================================== */
export { type NavbarProps };

/* ==========================================================================
   SUB-COMPONENTS
   ========================================================================== */

function NotificationDropdown() {
  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "absolute right-0 top-full mt-2 w-80",
        "rounded-xl border border-border bg-popover shadow-xl",
        "overflow-hidden",
      )}
    >
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">Notificações</p>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div
            key={notif.id}
            className={cn(
              "flex items-start gap-3 px-4 py-3",
              "border-b border-border last:border-b-0",
              "hover:bg-muted/50 transition-colors duration-150 cursor-pointer",
              notif.unread && "bg-primary/[0.03]",
            )}
          >
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                notif.unread
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Bell className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm leading-tight",
                  notif.unread
                    ? "font-semibold text-foreground"
                    : "font-medium text-muted-foreground",
                )}
              >
                {notif.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {notif.description}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                {notif.time}
              </p>
            </div>
            {notif.unread && (
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-border">
        <button
          className={cn(
            "w-full text-center text-xs font-medium text-primary cursor-pointer",
            "hover:text-primary/80 transition-colors duration-200",
          )}
        >
          Ver todas as notificações
        </button>
      </div>
    </motion.div>
  );
}

function ProfileDropdown({
  theme,
  toggle,
  navigateTo,
}: {
  theme: "light" | "dark";
  toggle: () => void;
  navigateTo: (page: string) => void;
}) {
  return (
    <motion.div
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "absolute right-0 top-full mt-2 w-56",
        "rounded-xl border border-border bg-popover shadow-xl",
        "overflow-hidden py-1",
      )}
    >
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">Dr. Admin</p>
        <p className="text-xs text-muted-foreground">admin@vigidoc.com</p>
      </div>

      <div className="py-1">
        <DropdownItem
          icon={User}
          label="Perfil"
          onClick={() => navigateTo("profile")}
        />
        <DropdownItem
          icon={Settings}
          label="Configurações"
          onClick={() => navigateTo("settings")}
        />
        <button
          onClick={toggle}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-2 text-sm cursor-pointer",
            "text-muted-foreground hover:bg-muted hover:text-foreground",
            "transition-all duration-150",
          )}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        </button>
      </div>

      <div className="border-t border-border pt-1">
        <DropdownItem
          icon={LogOut}
          label="Sair"
          onClick={() => {
            /* logout placeholder */
          }}
          danger
        />
      </div>
    </motion.div>
  );
}

function DropdownItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-2 text-sm cursor-pointer",
        "transition-all duration-150",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function DrawerItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  onClick,
  danger = false,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        danger
          ? "text-destructive hover:bg-destructive/10"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
