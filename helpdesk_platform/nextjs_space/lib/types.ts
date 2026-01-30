import { TipoCliente, StatusCliente, TicketStatus } from "@prisma/client";

export type { TipoCliente, StatusCliente, TicketStatus };

export interface Cliente {
  idCliente: string;
  nomeCliente: string;
  tipoCliente: TipoCliente;
  emailCliente: string;
  numeroCelularCliente?: string | null;
  statusCliente: StatusCliente;
  planoCliente?: string | null;
}

export interface Agente {
  id: string;
  nome: string;
  email: string;
}

export interface Ticket {
  id: string;
  ticketNumber: number;
  title: string;
  description: string;
  status: TicketStatus;
  clienteId: string;
  cliente?: Cliente;
  agenteId?: string | null;
  agente?: Agente | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  messages?: Message[];
  attachment?: Attachment | null;
}

export interface Message {
  id: string;
  ticketId: string;
  clienteId?: string | null;
  cliente?: Cliente | null;
  agenteId?: string | null;
  agente?: Agente | null;
  content: string;
  createdAt: Date | string;
}

export interface Attachment {
  id: string;
  ticketId: string;
  filename: string;
  cloudStoragePath: string;
  isPublic: boolean;
  size: number;
  createdAt: Date | string;
}

export const statusLabels: Record<TicketStatus, string> = {
  NOVO: "Novo",
  EM_ANALISE: "Em Análise",
  AGUARDANDO_CLIENTE: "Aguardando Cliente",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
  CANCELADO: "Cancelado"
};

export const statusColors: Record<TicketStatus, string> = {
  NOVO: "bg-blue-100 text-blue-800",
  EM_ANALISE: "bg-yellow-100 text-yellow-800",
  AGUARDANDO_CLIENTE: "bg-purple-100 text-purple-800",
  RESOLVIDO: "bg-green-100 text-green-800",
  FECHADO: "bg-gray-100 text-gray-800",
  CANCELADO: "bg-red-100 text-red-800"
};
