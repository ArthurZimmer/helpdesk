"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Ticket, Message, statusLabels } from "@/lib/types";
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
  RefreshCw,
  User
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TicketChatProps {
  ticket: Ticket & { messages: Message[] };
  currentUser: { id: string; name?: string; role: string };
  isAgent: boolean;
}

export function TicketChat({ ticket: initialTicket, currentUser, isAgent }: TicketChatProps) {
  const [ticket, setTicket] = useState(initialTicket);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [reopening, setReopening] = useState(false);
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

  const reopenTicket = async () => {
    setReopening(true);
    try {
      const res = await fetch(`/api/tickets/${ticket?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "EM_ANALISE" })
      });

      if (res.ok) {
        refreshTicket();
      }
    } catch (error) {
      console.error("Error reopening ticket:", error);
    } finally {
      setReopening(false);
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

  const backUrl = isAgent ? "/agente" : "/cliente";
  const canSendMessage = ticket?.status !== "FECHADO" && ticket?.status !== "CANCELADO";
  const canReopen = !isAgent && ticket?.status === "RESOLVIDO";

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
    if (currentUser.role === "CLIENTE") {
      return msg?.clienteId === currentUser.id;
    }
    return msg?.agenteId === currentUser.id;
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={backUrl}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Link>

      <Card className="overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div>
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
                {" "}por {ticket?.cliente?.nomeCliente}
              </p>
            </div>
            {canReopen && (
              <Button
                variant="outline"
                size="sm"
                onClick={reopenTicket}
                disabled={reopening}
              >
                {reopening ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Reabrir
              </Button>
            )}
          </div>

          {/* Description */}
          <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap">{ticket?.description}</p>
          </div>

          {/* Attachment */}
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
        <div className="p-6 max-h-96 overflow-y-auto space-y-4 bg-gray-50">
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
                      <span className={`text-xs font-medium ${
                        isOwn ? "text-purple-100" : "text-gray-500"
                      }`}>
                        {sender.name}
                        {sender.isAgent && !isOwn && " (Agente)"}
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
        {canSendMessage ? (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-3">
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 min-h-[60px] max-h-32"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={!message.trim() || sending}>
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
              Este chamado está {statusLabels[ticket?.status]?.toLowerCase() ?? "fechado"}. Não é possível enviar mensagens.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
