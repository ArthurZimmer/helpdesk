import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import { TicketChat } from "./_components/ticket-chat";

export default async function TicketPage({
  params
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    notFound();
  }

  const user = session.user as any;

  const ticket = await prisma.ticket.findUnique({
    where: { id: params.id },
    include: {
      cliente: { select: { idCliente: true, nomeCliente: true, emailCliente: true, tipoCliente: true, planoCliente: true } },
      agente: { select: { id: true, nome: true, email: true } },
      messages: {
        include: {
          cliente: { select: { idCliente: true, nomeCliente: true, emailCliente: true } },
          agente: { select: { id: true, nome: true, email: true } }
        },
        orderBy: { createdAt: "asc" }
      },
      attachment: true
    }
  });

  if (!ticket || (user.role === "CLIENTE" && ticket.clienteId !== user.id)) {
    notFound();
  }

  return <TicketChat ticket={ticket as any} currentUser={user} isAgent={false} />;
}
