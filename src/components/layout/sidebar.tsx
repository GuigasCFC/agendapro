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
  BarChart3,
  Settings,
} from "lucide-react";

import { cn } from "@/lib/utils";

const menuItems = [
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
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  organizationName: string;
}

export function Sidebar({ organizationName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="border-b p-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Agenda<span className="text-primary">Pro</span>
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {organizationName}
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <p className="text-center text-xs text-muted-foreground">
          AgendaPro v1.0
        </p>
      </div>
    </aside>
  );
}