"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { menuItems } from "@/components/layout/sidebar";

interface MobileNavProps {
  organizationName: string;
}

export function MobileNav({ organizationName }: MobileNavProps) {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="md:hidden" />}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menu</span>
      </SheetTrigger>

      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="text-lg">
            Agenda<span className="text-primary">Pro</span>
          </SheetTitle>
          <p className="truncate text-sm text-muted-foreground">
            {organizationName}
          </p>
        </SheetHeader>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <SheetClose
                key={item.title}
                render={<Link href={item.href} />}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  strokeWidth={isActive ? 2.25 : 2}
                />
                {item.title}
              </SheetClose>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
