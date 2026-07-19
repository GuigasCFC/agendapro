"use client";

import { Bell, LogOut, Moon, Search, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import type { MembershipRole } from "@/lib/generated/prisma/client";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/layout/mobile-nav";

const ROLE_LABELS: Record<MembershipRole, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  MEMBER: "Usuário",
};

interface HeaderProps {
  organizationName: string;
  userName: string;
  userEmail: string;
  role: MembershipRole;
}

export function Header({
  organizationName,
  userName,
  userEmail,
  role,
}: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const initial = userName.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex flex-1 items-center gap-3">
        <MobileNav organizationName={organizationName} />

        <div className="relative w-full max-w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Buscar..."
            aria-label="Buscar"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon" aria-label="Notificações">
          <Bell className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Alternar tema"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          <Moon className="h-5 w-5 dark:hidden" />
          <Sun className="hidden h-5 w-5 dark:block" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="flex items-center gap-2.5 rounded-lg border border-border px-2 py-1.5 transition-colors hover:bg-muted"
              />
            }
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {initial}
            </div>

            <div className="hidden text-left text-sm md:block">
              <p className="leading-none font-medium">{userName}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {ROLE_LABELS[role]}
              </p>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium text-foreground">
                  {userName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <form action={logout}>
          <Button
            variant="ghost"
            size="icon"
            type="submit"
            aria-label="Sair"
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </header>
  );
}
