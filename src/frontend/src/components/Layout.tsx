import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Scan,
  ShieldCheck,
  Upload,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  ocid: string;
  isActive: boolean;
}

function NavItem({ to, icon, label, ocid, isActive }: NavItemProps) {
  return (
    <Link to={to} data-ocid={ocid}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-primary/15 text-primary border border-primary/30"
            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
        )}
      >
        <span className={cn("shrink-0", isActive ? "text-primary" : "")}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
          />
        )}
      </div>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;

  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}…${principal.slice(-3)}`
    : "";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 flex flex-col bg-sidebar border-r border-sidebar-border">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Scan className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 blur-sm bg-primary/30 rounded" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-sidebar-foreground tracking-tight">
                ForensIQ
              </div>
              <div className="text-[10px] text-sidebar-foreground/40 font-mono tracking-widest uppercase">
                Image Analysis
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          <div className="text-[10px] font-mono text-sidebar-foreground/30 uppercase tracking-widest px-3 py-1 mb-2">
            Navigation
          </div>
          <NavItem
            to="/"
            icon={<LayoutDashboard className="w-4 h-4" />}
            label="Dashboard"
            ocid="nav.dashboard.link"
            isActive={pathname === "/"}
          />
          <NavItem
            to="/upload"
            icon={<Upload className="w-4 h-4" />}
            label="Upload & Analyze"
            ocid="nav.upload.link"
            isActive={pathname === "/upload"}
          />
        </nav>

        {/* Auth section */}
        <div className="p-3 border-t border-sidebar-border">
          {isInitializing ? (
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-sidebar-foreground/40">
              <div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />
              <span>Initializing…</span>
            </div>
          ) : isLoggedIn ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-sidebar-accent">
                <User className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-xs font-mono text-sidebar-foreground/70 truncate">
                  {shortPrincipal}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs h-8"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="w-full justify-start gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs h-8"
              variant="ghost"
            >
              {isLoggingIn ? (
                <div className="w-3.5 h-3.5 border border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              {isLoggingIn ? "Connecting…" : "Sign In"}
            </Button>
          )}
        </div>

        {/* System status */}
        <div className="px-4 pb-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-status-clean animate-pulse-scan" />
            <span className="text-[10px] font-mono text-sidebar-foreground/30">
              SYSTEM ONLINE
            </span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top bar */}
        <div className="shrink-0 h-12 border-b border-border flex items-center px-6 gap-4">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">
              {pathname === "/" && "CASE DASHBOARD"}
              {pathname === "/upload" && "NEW ANALYSIS"}
              {pathname.startsWith("/case/") && "CASE DETAIL"}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
            <span className="text-[10px] font-mono text-muted-foreground/50">
              ForensIQ v1.0
            </span>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>

      <Toaster theme="dark" richColors position="bottom-right" />
    </div>
  );
}
