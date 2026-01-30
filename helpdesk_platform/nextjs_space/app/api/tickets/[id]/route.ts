export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(
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

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
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

    if (!ticket) {
      return NextResponse.json({ message: "Chamado não encontrado" }, { status: 404 });
    }

    if (user.role === "CLIENTE" && ticket.clienteId !== user.id) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ message: "Erro ao buscar chamado" }, { status: 500 });
  }
}

export async function PATCH(
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
    const { status, agenteId } = body;

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
        { message: "Não é possível alterar um chamado fechado ou cancelado" },
        { status: 400 }
      );
    }

    const updateData: any = {};

    if (status) {
      if (user.role === "CLIENTE") {
        if (status === "EM_ANALISE" && ticket.status === "RESOLVIDO") {
          updateData.status = status;
        }
      } else {
        updateData.status = status;
      }
    }

    if (agenteId !== undefined && user.role === "AGENTE") {
      updateData.agenteId = agenteId;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        cliente: { select: { idCliente: true, nomeCliente: true, emailCliente: true, tipoCliente: true, planoCliente: true } },
        agente: { select: { id: true, nome: true, email: true } },
        attachment: true
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json({ message: "Erro ao atualizar chamado" }, { status: 500 });
  }
}
