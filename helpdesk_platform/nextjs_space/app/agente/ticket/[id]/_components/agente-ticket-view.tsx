"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Ticket, Message, statusLabels, TicketStatus } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  ArrowLeft,
  Send,
  Loader2,
  Paperclip,
  Download,
  User,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AgenteTicketViewProps {
  ticket: Ticket & { messages: Message[] };
  currentUser: { id: string; name?: string; role: string };
}

const AGENT_STATUS_OPTIONS: { value: TicketStatus; label: string; icon: React.ReactNode }[] = [
  { value: "EM_ANALISE", label: "Em Análise", icon: <Clock className="w-4 h-4" /> },
  { value: "AGUARDANDO_CLIENTE", label: "Aguardando Cliente", icon: <User className="w-4 h-4" /> },
  { value: "RESOLVIDO", label: "Resolvido", icon: <CheckCircle className="w-4 h-4" /> },
  { value: "FECHADO", label: "Fechado", icon: <CheckCircle className="w-4 h-4" /> },
  { value: "CANCELADO", label: "Cancelado", icon: <XCircle className="w-4 h-4" /> }
];

export function AgenteTicketView({ ticket: initialTicket, currentUser }: AgenteTicketViewProps) {
  const [ticket, setTicket] = useState(initialTicket);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [updating, setUpdating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticket?.messages]);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticket?.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message })
      });

      if (res.ok) {
        const newMessage = await res.json();
        setTicket((prev) => ({
          ...prev,
          messages: [...(prev?.messages ?? []), newMessage]
        }));
        setMessage("");
        refreshTicket();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const refreshTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket?.id}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data);
      }
    } catch (error) {
      console.error("Error refreshing ticket:", error);
    }
  };

  const updateStatus = async (newStatus: TicketStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/tickets/${ticket?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          agenteId: currentUser.id
        })
      });

      if (res.ok) {
        refreshTicket();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const downloadAttachment = async () => {
    if (!ticket?.attachment) return;

    try {
      const res = await fetch(
        `/api/files/${ticket.attachment.cloudStoragePath}`
      );
      if (res.ok) {
        const data = await res.json();
        const link = document.createElement("a");
        link.href = data.url;
        link.download = ticket.attachment.filename;
        link.click();
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const canModify = ticket?.status !== "FECHADO" && ticket?.status !== "CANCELADO";

  // Helper to get message sender info
  const getMessageSender = (msg: Message) => {
    if (msg?.agente) {
      return { name: msg.agente.nome, isAgent: true };
    }
    if (msg?.cliente) {
      return { name: msg.cliente.nomeCliente, isAgent: false };
    }
    return { name: "Usuário", isAgent: false };
  };

  const isOwnMessage = (msg: Message) => {
    return msg?.agenteId === currentUser.id;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/agente"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para fila
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-primary">
                  #{ticket?.ticketNumber}
                </span>
                <StatusBadge status={ticket?.status} />
              </div>
              <h1 className="text-xl font-bold text-gray-900">{ticket?.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Aberto{" "}
                {formatDistanceToNow(new Date(ticket?.createdAt ?? new Date()), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </p>

              <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket?.description}</p>
              </div>

              {ticket?.attachment && (
                <button
                  onClick={downloadAttachment}
                  className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary-dark"
                >
                  <Paperclip className="w-4 h-4" />
                  {ticket.attachment.filename}
                  <Download className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="p-6 max-h-80 overflow-y-auto space-y-4 bg-gray-50">
              {ticket?.messages?.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  Nenhuma mensagem ainda
                </p>
              ) : (
                ticket?.messages?.map((msg) => {
                  const isOwn = isOwnMessage(msg);
                  const sender = getMessageSender(msg);

                  return (
                    <div
                      key={msg?.id}
                      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          isOwn
                            ? "bg-primary text-white"
                            : sender.isAgent
                            ? "bg-green-100 text-gray-900"
                            : "bg-white text-gray-900 border border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-3 h-3" />
                          <span
                            className={`text-xs font-medium ${
                              isOwn ? "text-purple-100" : "text-gray-500"
                            }`}
                          >
                            {sender.name}
                            {!sender.isAgent && " (Cliente)"}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg?.content}</p>
                        <p
                          className={`text-xs mt-2 ${
                            isOwn ? "text-purple-200" : "text-gray-400"
                          }`}
                        >
                          {format(new Date(msg?.createdAt ?? new Date()), "dd/MM/yyyy HH:mm", {
                            locale: ptBR
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {canModify ? (
              <div className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite sua resposta..."
                    className="flex-1 min-h-[60px] max-h-32"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || sending}
                  >
                    {sending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-200 bg-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Este chamado está {statusLabels[ticket?.status]?.toLowerCase() ?? "fechado"}.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Customer info */}
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Cliente</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="text-gray-500">Nome:</span> {ticket?.cliente?.nomeCliente}
              </p>
              <p className="text-gray-700">
                <span className="text-gray-500">Email:</span> {ticket?.cliente?.emailCliente}
              </p>
              <p className="text-gray-700">
                <span className="text-gray-500">Tipo:</span> {ticket?.cliente?.tipoCliente}
              </p>
              {ticket?.cliente?.planoCliente && (
                <p className="text-gray-700">
                  <span className="text-gray-500">Plano:</span> {ticket?.cliente?.planoCliente}
                </p>
              )}
            </div>
          </Card>

          {/* Status change */}
          {canModify && (
            <Card className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Alterar Status</h3>
              <div className="space-y-2">
                {AGENT_STATUS_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateStatus(option.value)}
                    disabled={updating || ticket?.status === option.value}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      ticket?.status === option.value
                        ? "bg-primary/10 text-primary font-medium"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    {option.icon}
                    {option.label}
                    {updating && ticket?.status !== option.value && (
                      <Loader2 className="w-3 h-3 animate-spin ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          )}

          {/* Assignment */}
          <Card className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Atribuído a</h3>
            <p className="text-sm text-gray-700">
              {ticket?.agente?.nome ?? "Não atribuído"}
            </p>
            {!ticket?.agente && canModify && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full"
                onClick={() => updateStatus("EM_ANALISE")}
                disabled={updating}
              >
                Assumir chamado
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
