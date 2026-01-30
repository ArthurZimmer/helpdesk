"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ticket, LogOut, User } from "lucide-react";

interface ClienteHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function ClienteHeader({ user }: ClienteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/cliente" className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Helpdesk</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">{user?.name ?? "Cliente"}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
