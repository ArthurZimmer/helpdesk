"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Ticket, TicketStatus, statusLabels } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ChevronRight, InboxIcon, Search, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "NOVO", label: "Novo" },
  { value: "EM_ANALISE", label: "Em Análise" },
  { value: "AGUARDANDO_CLIENTE", label: "Aguardando Cliente" },
  { value: "RESOLVIDO", label: "Resolvido" },
  { value: "FECHADO", label: "Fechado" }
];

export function AgenteTicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, search]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/tickets?${params.toString()}`);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Buscar por número ou título..."
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Buscar
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUS_FILTERS.map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ticket counts */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.slice(1).map((filter) => {
          const count = tickets?.filter((t) => t?.status === filter.value)?.length ?? 0;
          if (statusFilter !== "all" && statusFilter !== filter.value) return null;
          return (
            <span
              key={filter.value}
              className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600"
            >
              {filter.label}: {count}
            </span>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !tickets?.length ? (
        <div className="text-center py-12">
          <InboxIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Nenhum chamado</h3>
          <p className="text-gray-500 mt-1">
            {search || statusFilter !== "all"
              ? "Nenhum chamado encontrado com esses filtros"
              : "Não há chamados no sistema"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {tickets.map((ticket) => (
            <Link
              key={ticket?.id}
              href={`/agente/ticket/${ticket?.id}`}
              className="block py-4 px-2 -mx-2 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-medium text-primary">
                      #{ticket?.ticketNumber}
                    </span>
                    <StatusBadge status={ticket?.status} />
                  </div>
                  <h3 className="font-medium text-gray-900 truncate">
                    {ticket?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <span>{ticket?.cliente?.nomeCliente}</span>
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(ticket?.createdAt ?? new Date()), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
