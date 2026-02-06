-- CreateEnum
CREATE TYPE "TipoCliente" AS ENUM ('PF', 'PJ');

-- CreateEnum
CREATE TYPE "StatusCliente" AS ENUM ('ATIVO', 'INATIVO', 'SUSPENSO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('NOVO', 'EM_ANALISE', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Cliente" (
    "idCliente" TEXT NOT NULL,
    "nomeCliente" TEXT NOT NULL,
    "tipoCliente" "TipoCliente" NOT NULL DEFAULT 'PF',
    "emailCliente" TEXT NOT NULL,
    "senhaCliente" TEXT NOT NULL,
    "numeroCelularCliente" TEXT,
    "statusCliente" "StatusCliente" NOT NULL DEFAULT 'ATIVO',
    "planoCliente" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("idCliente")
);

-- CreateTable
CREATE TABLE "Agente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "ticketNumber" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'NOVO',
    "clienteId" TEXT NOT NULL,
    "agenteId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "clienteId" TEXT,
    "agenteId" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "cloudStoragePath" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_emailCliente_key" ON "Cliente"("emailCliente");

-- CreateIndex
CREATE UNIQUE INDEX "Agente_email_key" ON "Agente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_ticketId_key" ON "Attachment"("ticketId");

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("idCliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("idCliente") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_agenteId_fkey" FOREIGN KEY ("agenteId") REFERENCES "Agente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
