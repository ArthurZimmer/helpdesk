import Link from "next/link";
import { Plus, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ClienteTicketList } from "./_components/cliente-ticket-list";

export default function ClienteDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Chamados</h1>
          <p className="text-gray-500 mt-1">Acompanhe seus chamados de suporte</p>
        </div>
        <Link href="/cliente/novo">
          <Button size="lg" className="w-full sm:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Abrir Novo Chamado
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            Lista de Chamados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteTicketList />
        </CardContent>
      </Card>
    </div>
  );
}
