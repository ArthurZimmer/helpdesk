"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ticket, LogOut, Shield } from "lucide-react";

interface AgenteHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
  };
}

export function AgenteHeader({ user }: AgenteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/agente" className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-gray-900">Helpdesk</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            Agente
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4 text-primary" />
            <span className="hidden sm:inline">{user?.name ?? "Agente"}</span>
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
