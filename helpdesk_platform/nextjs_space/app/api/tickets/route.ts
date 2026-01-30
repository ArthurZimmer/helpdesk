export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let whereClause: any = {};

    if (user.role === "CLIENTE") {
      whereClause.clienteId = user.id;
    }

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { ticketNumber: { equals: parseInt(search) || -1 } }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        cliente: { select: { idCliente: true, nomeCliente: true, emailCliente: true, tipoCliente: true, planoCliente: true } },
        agente: { select: { id: true, nome: true, email: true } },
        attachment: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json({ message: "Erro ao buscar chamados" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const user = session.user as any;
    
    if (user.role !== "CLIENTE") {
      return NextResponse.json({ message: "Apenas clientes podem criar chamados" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, attachmentData } = body;

    if (!title || !description) {
      return NextResponse.json(
        { message: "Título e descrição são obrigatórios" },
        { status: 400 }
      );
    }

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        clienteId: user.id,
        status: "NOVO",
        ...(attachmentData && {
          attachment: {
            create: {
              filename: attachmentData.filename,
              cloudStoragePath: attachmentData.cloudStoragePath,
              isPublic: attachmentData.isPublic || false,
              size: attachmentData.size
            }
          }
        })
      },
      include: {
        cliente: { select: { idCliente: true, nomeCliente: true, emailCliente: true } },
        attachment: true
      }
    });

    // Send notification email
    try {
      const appUrl = process.env.NEXTAUTH_URL || "";
      const appName = appUrl ? new URL(appUrl).hostname.split(".")[0] : "Helpdesk";

      const htmlBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 10px;">
            🎫 Novo Chamado Aberto - #${ticket.ticketNumber}
          </h2>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 10px 0;"><strong>Título:</strong> ${ticket.title}</p>
            <p style="margin: 10px 0;"><strong>Cliente:</strong> ${ticket.cliente.nomeCliente} (${ticket.cliente.emailCliente})</p>
            <p style="margin: 10px 0;"><strong>Descrição:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #7C3AED;">
              ${ticket.description}
            </div>
            ${ticket.attachment ? `<p style="margin: 10px 0;"><strong>Anexo:</strong> ${ticket.attachment.filename}</p>` : ""}
          </div>
          <p style="color: #666; font-size: 12px;">
            Enviado em: ${new Date().toLocaleString("pt-BR")}
          </p>
        </div>
      `;

      await fetch("https://apps.abacus.ai/api/sendNotificationEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deployment_token: process.env.ABACUSAI_API_KEY,
          app_id: process.env.WEB_APP_ID,
          notification_id: process.env.NOTIF_ID_NOVO_CHAMADO_ABERTO,
          subject: `Novo Chamado #${ticket.ticketNumber} - ${ticket.title}`,
          body: htmlBody,
          is_html: true,
          recipient_email: "izeautomacoes@gmail.com",
          sender_email: `noreply@${appUrl ? new URL(appUrl).hostname : "helpdesk.app"}`,
          sender_alias: appName
        })
      });
    } catch (emailError) {
      console.error("Error sending notification email:", emailError);
    }

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ message: "Erro ao criar chamado" }, { status: 500 });
  }
}
