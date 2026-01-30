"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowLeft, Send, Loader2, Paperclip, X } from "lucide-react";

export default function NovoTicketPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Arquivo muito grande. Máximo 10MB");
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let attachmentData = null;

      if (file) {
        // Get presigned URL
        const presignedRes = await fetch("/api/upload/presigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            contentType: file.type,
            fileSize: file.size,
            isPublic: false
          })
        });

        if (!presignedRes.ok) {
          const data = await presignedRes.json();
          throw new Error(data.message || "Erro ao fazer upload do arquivo");
        }

        const { uploadUrl, cloudStoragePath } = await presignedRes.json();

        // Check if content-disposition is in signed headers
        const urlParams = new URL(uploadUrl);
        const signedHeaders = urlParams.searchParams.get("X-Amz-SignedHeaders") || "";
        const hasContentDisposition = signedHeaders.toLowerCase().includes("content-disposition");

        // Upload file to S3
        const uploadHeaders: HeadersInit = {
          "Content-Type": file.type
        };
        if (hasContentDisposition) {
          uploadHeaders["Content-Disposition"] = "attachment";
        }

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: uploadHeaders,
          body: file
        });

        if (!uploadRes.ok) {
          throw new Error("Erro ao fazer upload do arquivo");
        }

        attachmentData = {
          filename: file.name,
          cloudStoragePath,
          isPublic: false,
          size: file.size
        };
      }

      // Create ticket
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          attachmentData
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Erro ao criar chamado");
      }

      const ticket = await res.json();
      router.push(`/cliente/ticket/${ticket.id}`);
    } catch (err: any) {
      setError(err.message || "Erro ao criar chamado");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/cliente"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar para meus chamados
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Abrir Novo Chamado</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Título do chamado *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Descreva brevemente o problema"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Descrição detalhada *
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explique o problema com detalhes..."
                rows={6}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Anexo (opcional)
              </label>
              {file ? (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Paperclip className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 text-sm text-gray-700 truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                  />
                  <div className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
                    <Paperclip className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      Clique ou arraste um arquivo (máx. 10MB)
                    </span>
                  </div>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Formatos aceitos: imagens, PDF, Word, Excel, TXT, CSV
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar Chamado
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
