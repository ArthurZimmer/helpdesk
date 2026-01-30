export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const ticketId = params.id;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { message: "Mensagem não pode estar vazia" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json({ message: "Chamado não encontrado" }, { status: 404 });
    }

    if (user.role === "CLIENTE" && ticket.clienteId !== user.id) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    if (ticket.status === "FECHADO" || ticket.status === "CANCELADO") {
      return NextResponse.json(
        { message: "Não é possível adicionar mensagens a um chamado fechado" },
        { status: 400 }
      );
    }

    const messageData: any = {
      ticketId,
      content: content.trim()
    };

    if (user.role === "CLIENTE") {
      messageData.clienteId = user.id;
    } else {
      messageData.agenteId = user.id;
    }

    const message = await prisma.message.create({
      data: messageData,
      include: {
        cliente: { select: { idCliente: true, nomeCliente: true, emailCliente: true } },
        agente: { select: { id: true, nome: true, email: true } }
      }
    });

    // Update ticket status based on who sent the message
    let newStatus = ticket.status;
    if (user.role === "AGENTE" && ticket.status === "NOVO") {
      newStatus = "EM_ANALISE";
    } else if (user.role === "AGENTE" && ticket.status !== "RESOLVIDO") {
      newStatus = "AGUARDANDO_CLIENTE";
    } else if (user.role === "CLIENTE" && ticket.status === "AGUARDANDO_CLIENTE") {
      newStatus = "EM_ANALISE";
    }

    if (newStatus !== ticket.status) {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: newStatus }
      });
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json({ message: "Erro ao enviar mensagem" }, { status: 500 });
  }
}
