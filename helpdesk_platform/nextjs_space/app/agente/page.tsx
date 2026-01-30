import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Inbox } from "lucide-react";
import { AgenteTicketList } from "./_components/agente-ticket-list";

export default function AgenteDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fila de Chamados</h1>
        <p className="text-gray-500 mt-1">Gerencie os chamados de suporte</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-primary" />
            Todos os Chamados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AgenteTicketList />
        </CardContent>
      </Card>
    </div>
  );
}
