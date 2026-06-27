"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "flowbite-react";
import { HiOutlineUpload, HiPhotograph, HiTrash } from "react-icons/hi";
import { PermBased } from "@/app/(home)/hooks/usePermBased";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useToast } from "@/app/context/toast";
import {
   useUploadPassaporteImagem,
   useDeletePassaporteImagem,
} from "@/hooks/queries";

const TIPOS_ACEITOS = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const LABELS: Record<TipoImagem, string> = {
   passaporte: "Imagem do passaporte",
   visa: "Imagem do visto",
};

type TipoImagem = "passaporte" | "visa";

interface DocumentoImagemProps {
   tripId: number;
   tipo: TipoImagem;
   url: string | null;
}

/**
 * Exibe e gerencia a imagem (JPG) de UM documento (passaporte ou visto).
 *
 * As ações são gateadas pelo recurso próprio `passaporte.image` (independente
 * das permissões dos dados textuais do passaporte): enviar exige `create`,
 * trocar `update`, remover `delete`. A `url` (signed URL) chega por prop — só
 * vem preenchida para quem tem `passaporte.image.view`. O preview é estado
 * local (`currentUrl`), atualizado pelo retorno da mutação para refletir na
 * hora, sem depender do snapshot do pai (que não acompanha o refetch).
 */
export function DocumentoImagem({ tripId, tipo, url }: DocumentoImagemProps) {
   const { push } = useToast();
   const inputRef = useRef<HTMLInputElement>(null);
   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

   // O `item` do modal é um snapshot (não atualiza no refetch da lista), então
   // o preview é estado local: semeado pela prop e atualizado pelo retorno da
   // mutação (upload devolve a nova signed URL; delete zera) para refletir na
   // hora, sem depender do snapshot do pai.
   const [currentUrl, setCurrentUrl] = useState<string | null>(url);
   useEffect(() => setCurrentUrl(url), [url]);

   const uploadMutation = useUploadPassaporteImagem();
   const deleteMutation = useDeletePassaporteImagem();
   const isBusy = uploadMutation.isPending || deleteMutation.isPending;

   const handlePick = () => inputRef.current?.click();

   const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // permite re-selecionar o mesmo arquivo
      if (!file) return;

      if (!TIPOS_ACEITOS.includes(file.type)) {
         push({
            title: "Erro",
            message: "Envie uma imagem JPG ou PNG",
            type: "error",
         });
         return;
      }
      if (file.size > MAX_FILE_SIZE) {
         push({
            title: "Erro",
            message: "A imagem excede o limite de 10 MB",
            type: "error",
         });
         return;
      }

      try {
         const res = await uploadMutation.mutateAsync({
            trip_id: tripId,
            tipo,
            file,
         });
         setCurrentUrl(
            tipo === "passaporte" ? res.passaporte_url : res.visa_url
         );
         push({ message: "Imagem enviada com sucesso", type: "success" });
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao enviar imagem";
         push({ title: "Erro", message, type: "error" });
      }
   };

   const handleDelete = async () => {
      try {
         await deleteMutation.mutateAsync({ trip_id: tripId, tipo });
         setCurrentUrl(null);
         push({ message: "Imagem removida com sucesso", type: "success" });
      } catch (err: unknown) {
         const message =
            err instanceof Error ? err.message : "Erro ao remover imagem";
         push({ title: "Erro", message, type: "error" });
      } finally {
         setShowDeleteConfirm(false);
      }
   };

   return (
      <div className="space-y-2">
         {currentUrl ? (
            <a
               href={currentUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="block"
            >
               <img
                  src={currentUrl}
                  alt={LABELS[tipo]}
                  className="h-48 w-full rounded border border-slate-200 object-cover shadow-sm"
               />
            </a>
         ) : (
            <div className="flex h-48 w-full flex-col items-center justify-center gap-1 rounded border border-dashed border-slate-300 bg-gray-50 text-gray-400">
               <HiPhotograph className="h-8 w-8" />
               <span className="text-xs font-medium">Sem imagem</span>
            </div>
         )}

         <div className="flex justify-center gap-2">
            <input
               ref={inputRef}
               type="file"
               accept="image/jpeg,image/png"
               className="hidden"
               onChange={handleFile}
            />
            <PermBased
               resource="passaporte.image"
               requiredPerm={currentUrl ? "update" : "create"}
            >
               <Button
                  size="xs"
                  color="gray"
                  onClick={handlePick}
                  disabled={isBusy}
               >
                  {uploadMutation.isPending ? (
                     <Spinner size="sm" color="info" />
                  ) : (
                     <>
                        <HiOutlineUpload className="mr-1.5 h-4 w-4" />
                        {currentUrl ? "Trocar" : "Enviar"}
                     </>
                  )}
               </Button>
            </PermBased>
            {currentUrl && (
               <PermBased resource="passaporte.image" requiredPerm="delete">
                  <Button
                     size="xs"
                     color="red"
                     onClick={() => setShowDeleteConfirm(true)}
                     disabled={isBusy}
                  >
                     <HiTrash className="mr-1.5 h-4 w-4" />
                     Remover
                  </Button>
               </PermBased>
            )}
         </div>

         <ConfirmModal
            show={showDeleteConfirm}
            title="Remover imagem"
            description={`Remover a ${LABELS[tipo].toLowerCase()}? Esta ação não pode ser desfeita.`}
            isLoading={deleteMutation.isPending}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={handleDelete}
            confirmButtonText="Remover"
            icon={HiTrash}
         />
      </div>
   );
}
