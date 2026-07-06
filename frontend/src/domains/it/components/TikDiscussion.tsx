import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Send, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/authContext";
import * as api from "../api/tikApi";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

interface Props {
  ticketId: number;
  canComment: boolean;
}

/**
 * Fil de discussion d'un ticket — échange libre entre demandeur, validateur
 * et intervenant assigné (portage du legacy). `canComment` vient de
 * `ticket.actions.peutCommenter`, calculé côté serveur.
 */
export default function TikDiscussion({ ticketId, canComment }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["tik", "commentaires", ticketId],
    queryFn: () => api.fetchCommentaires(ticketId),
  });

  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const mutation = useMutation({
    mutationFn: () => api.postCommentaire(ticketId, text.trim(), files),
    onSuccess: () => {
      setText("");
      setFiles([]);
      qc.invalidateQueries({ queryKey: ["tik", "commentaires", ticketId] });
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      toast.error(err?.response?.data?.error ?? "Message non envoyé.");
    },
  });

  const addFiles = (list: FileList) => {
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border rounded-md p-4 space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">Discussion</h2>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {isLoading ? (
          <p className="text-xs text-gray-400">Chargement…</p>
        ) : messages.length === 0 ? (
          <p className="text-xs text-gray-400">Pas encore de message.</p>
        ) : (
          messages.map((m) => {
            const isMine = m.user?.id === user?.id;
            return (
              <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    isMine ? "bg-brand-dark text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {!isMine && <p className="text-xs font-semibold mb-0.5">{m.user?.displayName ?? "—"}</p>}
                  <p className="whitespace-pre-wrap">{m.commentaire}</p>
                  {m.fichiers.length > 0 && (
                    <ul className="mt-1.5 space-y-1">
                      {m.fichiers.map((f, i) => (
                        <li key={i}>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className={`text-xs underline ${isMine ? "text-brand-primary" : "text-blue-600"}`}
                          >
                            {f.name} <span className="opacity-70">({f.sizeKb} Ko)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className={`text-xs mt-1 ${isMine ? "text-white/70" : "text-gray-400"}`}>
                    {fmtDateTime(m.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {canComment && (
        <div className="border-t pt-3 space-y-2">
          {files.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-1 text-xs bg-gray-50 border rounded px-2 py-0.5">
                  <span className="truncate max-w-[140px]">{f.name}</span>
                  <button type="button" onClick={() => removeFile(i)}>
                    <X size={12} className="text-gray-400 hover:text-gray-600" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Écrire un message…"
              rows={2}
              className="flex-1"
            />
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Ajouter des fichiers"
            >
              <Paperclip size={15} />
            </Button>
            <Button
              size="icon"
              type="button"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || !text.trim()}
              title="Envoyer"
            >
              <Send size={15} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
