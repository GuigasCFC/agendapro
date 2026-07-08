"use client";

import { Bell, LogOut, Moon, Search, Sun } from "lucide-react";

import type { MembershipRole } from "@/lib/generated/prisma/client";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ROLE_LABELS: Record<MembershipRole, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MEMBER: "Usuário",
};

interface HeaderProps {
  userName: string;
  userEmail: string;
  role: MembershipRole;
}

export function Header({ userName, userEmail, role }: HeaderProps) {
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Search..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
        >
          <Moon className="h-5 w-5 dark:hidden" />
          <Sun className="hidden h-5 w-5 dark:block" />
        </Button>

        <div
          className="flex items-center gap-3 rounded-lg border px-3 py-2"
          title={userEmail}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
            {initial}
          </div>

          <div className="hidden text-sm md:block">
            <p className="font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground">
              {ROLE_LABELS[role]}
            </p>
          </div>
        </div>

        <form action={logout}>
          <Button variant="ghost" size="icon" type="submit" title="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}