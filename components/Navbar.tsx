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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeContext, useNavigation } from "@/lib/contexts";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import {
  MAIN_NAV_ITEMS,
  USER_NAV_ITEMS,
  APP_ROUTES,
  type NavItem,
} from "@/config/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

/* ==========================================================================
   TYPES
   ========================================================================== */

interface NavbarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

interface AppNotification {
  id: number;
  title: string;
  description: string;
  time: string;
  unread: boolean;
}

/** Notifications are currently mock data */
const MOCK_NOTIFICATIONS: AppNotification[] = [
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
   ANIMATION VARIANTS (Framer Motion)
   ========================================================================== */

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeIn" } },
} as const;

const drawerVariants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
} as const;

const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: 0.15, ease: "easeIn" },
  },
} as const;

/* ==========================================================================
   NAVBAR COMPONENT
   ========================================================================== */

export default function Navbar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: NavbarProps) {
  const { data: session, isPending } = useSession();
  const user = session?.user;

  const { theme, toggle } = useThemeContext();
  const { currentPage, setCurrentPage } = useNavigation();
  const router = useRouter();
  const pathname = usePathname();

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Auto-hide top bar on mobile scroll
  const [topBarVisible, setTopBarVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Refs for click-outside closing
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  /* ---- Auto-hide logic (mobile only, < 1024px) ---- */
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth >= 1024) {
        setTopBarVisible(true);
        return;
      }
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 60) {
        setTopBarVisible(false); // scrolling down
      } else {
        setTopBarVisible(true); // scrolling up
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
    (pageId: string) => {
      setIsMobileMenuOpen(false);
      setIsNotifOpen(false);
      setIsProfileOpen(false);

      const item = [...MAIN_NAV_ITEMS, ...USER_NAV_ITEMS].find(
        (i) => i.id === pageId,
      );
      if (item && item.href !== "#") {
        router.push(item.href);
      } else if (pageId === "scan") {
        router.push(APP_ROUTES.SCAN);
      } else {
        setCurrentPage(pageId);
      }
    },
    [setCurrentPage, setIsMobileMenuOpen, router],
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
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold text-foreground tracking-tight">
            Vigi<span className="text-primary">Doc</span>
          </span>
        </div>

        {/* Nav links */}
        <NavigationMenu className="flex-1 justify-center max-w-none">
          <NavigationMenuList className="gap-1">
            {MAIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <NavigationMenuItem key={item.id}>
                  <NavigationMenuLink asChild active={isActive}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
                        "transition-all duration-200",
                        !isActive &&
                          "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>

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
            {isPending ? (
              <div className="flex items-center gap-2 p-1.5 pr-3 rounded-lg border border-transparent">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-20 bg-muted rounded animate-pulse hidden xl:inline" />
              </div>
            ) : (
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
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </div>
                <span className="text-sm font-medium text-foreground hidden xl:inline">
                  {user?.name || "Usuário"}
                </span>
              </button>
            )}
            <AnimatePresence>
              {isProfileOpen && (
                <ProfileDropdown
                  theme={theme}
                  toggle={toggle}
                  navigateTo={navigateTo}
                  user={user}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

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
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <span className="text-base font-bold text-foreground tracking-tight">
            Vigi<span className="text-primary">Doc</span>
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1">
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

          {/* Profile avatar */}
          <div ref={profileRef} className="relative">
            {isPending ? (
              <div className="p-1.5 rounded-lg">
                <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
              </div>
            ) : (
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
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden">
                  {user?.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary" />
                  )}
                </div>
              </button>
            )}
            <AnimatePresence>
              {isProfileOpen && (
                <ProfileDropdown
                  theme={theme}
                  toggle={toggle}
                  navigateTo={navigateTo}
                  user={user}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE BOTTOM NAVIGATION  (visible only on < lg)
          ────────────────────────────────────────────────────────────────── */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-end justify-around",
          "h-16 px-2 pb-1",
          "bg-background/90 backdrop-blur-xl",
          "border-t border-border",
          "transition-colors duration-300",
        )}
      >
        {MAIN_NAV_ITEMS.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <React.Fragment key={item.id}>
              {/* Insert FAB scan button before the 3rd item (index 2) */}
              {index === 2 && (
                <button
                  onClick={() => navigateTo("scan")}
                  className={cn(
                    "relative -top-3 flex flex-col items-center justify-center",
                    "h-14 w-14 rounded-full cursor-pointer",
                    "bg-gradient-to-br from-teal-500 to-emerald-500",
                    "shadow-lg shadow-teal-500/30",
                    "text-white",
                    "transition-all duration-200",
                    "hover:shadow-xl hover:shadow-teal-500/40 hover:scale-105",
                    "active:scale-95",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                  )}
                  aria-label="Scan"
                >
                  <ScanLine className="h-6 w-6" />
                </button>
              )}

              <button
                onClick={() => navigateTo(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5",
                  "flex-1 pt-2 pb-1 cursor-pointer",
                  "transition-all duration-200",
                  "focus-visible:outline-none",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
                aria-label={item.label}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive && "text-primary",
                  )}
                />
                <span className="text-[10px] font-medium leading-tight">
                  {item.label}
                </span>
                {/* Active dot indicator */}
                {isActive && (
                  <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />
                )}
              </button>
            </React.Fragment>
          );
        })}
        {/* Menu trigger button (mobile only) */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={cn(
            "flex flex-col items-center justify-center gap-0.5",
            "flex-1 pt-2 pb-1 cursor-pointer text-muted-foreground",
            "transition-all duration-200 focus-visible:outline-none",
          )}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-tight">Menu</span>
        </button>
      </nav>

      {/* ──────────────────────────────────────────────────────────────────
          MOBILE DRAWER  (slides in from right)
          ────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop overlay */}
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

            {/* Drawer panel */}
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
                {isPending ? (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden">
                      {user?.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {user?.name || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || "usuario@vigidoc.com"}
                      </p>
                    </div>
                  </div>
                )}
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
                  {MAIN_NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
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
                      currentPage === "scan" || pathname === APP_ROUTES.SCAN
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <ScanLine className="h-4 w-4" />
                    Scan
                  </button>
                </div>

                {/* Divider */}
                <div className="my-4 border-t border-border" />

                {/* Secondary actions */}
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

                  {/* Divider */}
                  <div className="my-2 border-t border-border" />

                  <DrawerItem
                    icon={LogOut}
                    label="Sair"
                    onClick={() => navigateTo("logout")}
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
   SUB-COMPONENTS (kept in same file for simplicity)
   ========================================================================== */

/** Notification dropdown panel */
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
            {/* Icon */}
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
            {/* Content */}
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
            {/* Unread dot */}
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

/** Profile / account dropdown */
function ProfileDropdown({
  theme,
  toggle,
  navigateTo,
  user,
}: {
  theme: "light" | "dark";
  toggle: () => void;
  navigateTo: (page: string) => void;
  user: any;
}) {
  const router = useRouter();

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
      {/* User info header */}
      <div className="px-4 py-3 border-b border-border">
        <p className="text-sm font-semibold text-foreground">
          {user?.name || "Usuário"}
        </p>
        <p className="text-xs text-muted-foreground">
          {user?.email || "usuario@vigidoc.com"}
        </p>
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
          onClick={() => router.push("/logout")}
          danger
        />
      </div>
    </motion.div>
  );
}

/** Reusable dropdown menu item */
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

/** Reusable drawer menu item */
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
