export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getFileUrl } from "@/lib/s3";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const cloudStoragePath = params.path?.join("/");
    if (!cloudStoragePath) {
      return NextResponse.json({ message: "Caminho inválido" }, { status: 400 });
    }

    const attachment = await prisma.attachment.findFirst({
      where: { cloudStoragePath },
      include: {
        ticket: { select: { clienteId: true } }
      }
    });

    if (!attachment) {
      return NextResponse.json({ message: "Arquivo não encontrado" }, { status: 404 });
    }

    const user = session.user as any;
    if (user.role === "CLIENTE" && attachment.ticket?.clienteId !== user.id) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    const fileUrl = await getFileUrl(cloudStoragePath, attachment.isPublic);

    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Error getting file URL:", error);
    return NextResponse.json({ message: "Erro ao obter arquivo" }, { status: 500 });
  }
}
