"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  Calendar,
  Scissors,
  UserCog,
  Wallet,
  Bell,
  BarChart3,
  Settings,
  CreditCard,
} from "lucide-react";

import { cn } from "@/lib/utils";

export const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    title: "Appointments",
    href: "/appointments",
    icon: Calendar,
  },
  {
    title: "Services",
    href: "/services",
    icon: Scissors,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: UserCog,
  },
  {
    title: "Finance",
    href: "/finance",
    icon: Wallet,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Subscription",
    href: "/subscription",
    icon: CreditCard,
  },
];

interface SidebarProps {
  organizationName: string;
}

export function Sidebar({ organizationName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <h1 className="text-lg font-semibold tracking-tight text-sidebar-foreground">
          Agenda<span className="text-primary">Pro</span>
        </h1>
      </div>

      <div className="border-b border-sidebar-border px-6 py-3">
        <p className="truncate text-sm font-medium text-sidebar-foreground/80">
          {organizationName}
        </p>
      </div>

      <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.title}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className="h-[18px] w-[18px]"
                strokeWidth={isActive ? 2.25 : 2}
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <p className="text-center text-xs text-muted-foreground">
          AgendaPro v1.0
        </p>
      </div>
    </aside>
  );
}
