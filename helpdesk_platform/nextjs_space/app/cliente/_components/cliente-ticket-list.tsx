"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Loader2, ChevronRight, InboxIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ClienteTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        setTickets(data ?? []);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!tickets?.length) {
    return (
      <div className="text-center py-12">
        <InboxIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Nenhum chamado</h3>
        <p className="text-gray-500 mt-1">Você ainda não abriu nenhum chamado</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {tickets.map((ticket) => (
        <Link
          key={ticket.id}
          href={`/cliente/ticket/${ticket.id}`}
          className="block py-4 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-primary">#{ticket.ticketNumber}</span>
                <StatusBadge status={ticket.status} />
              </div>
              <h3 className="font-medium text-gray-900 truncate">{ticket.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {formatDistanceToNow(new Date(ticket.createdAt), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>
        </Link>
      ))}
    </div>
  );
}
