"use client";

import { useRef } from "react";
import { Button, Spinner } from "flowbite-react";
import { FaImage, FaUpload, FaTrashCan } from "react-icons/fa6";

// Espelha os limites do backend (routers/organizacoes.py): JPG/PNG, 5 MB.
const ACCEPT = "image/jpeg,image/png";
const MAX_SIZE = 5 * 1024 * 1024;

interface BrasaoUploaderProps {
   sigla: string;
   brasaoUrl: string | null;
   isUploading: boolean;
   isDeleting: boolean;
   onUpload: (file: File) => void;
   onDelete: () => void;
   onValidationError: (message: string) => void;
}

export function BrasaoUploader({
   sigla,
   brasaoUrl,
   isUploading,
   isDeleting,
   onUpload,
   onDelete,
   onValidationError,
}: BrasaoUploaderProps) {
   const inputRef = useRef<HTMLInputElement>(null);
   const busy = isUploading || isDeleting;

   function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0];
      // Reseta o input para permitir reenviar o mesmo arquivo após um erro.
      e.target.value = "";
      if (!file) return;

      if (!["image/jpeg", "image/png"].includes(file.type)) {
         onValidationError("Selecione uma imagem JPG ou PNG.");
         return;
      }
      if (file.size > MAX_SIZE) {
         onValidationError("A imagem excede o limite de 5 MB.");
         return;
      }
      onUpload(file);
   }

   return (
      <div className="flex items-center gap-4">
         <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded border border-slate-200 bg-slate-50">
            {brasaoUrl ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img
                  src={brasaoUrl}
                  alt={`Brasão de ${sigla.toUpperCase()}`}
                  className="h-full w-full object-contain"
               />
            ) : (
               <FaImage className="h-7 w-7 text-slate-300" />
            )}
         </div>

         <div className="flex flex-col gap-2">
            <input
               ref={inputRef}
               type="file"
               accept={ACCEPT}
               className="hidden"
               onChange={handleFile}
            />
            <div className="flex flex-wrap gap-2">
               <Button
                  size="xs"
                  color="light"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
               >
                  {isUploading ? (
                     <Spinner size="sm" color="gray" className="mr-2" />
                  ) : (
                     <FaUpload className="mr-2 h-3.5 w-3.5" />
                  )}
                  {brasaoUrl ? "Trocar brasão" : "Enviar brasão"}
               </Button>
               {brasaoUrl && (
                  <Button
                     size="xs"
                     color="red"
                     disabled={busy}
                     onClick={onDelete}
                  >
                     {isDeleting ? (
                        <Spinner size="sm" color="gray" className="mr-2" />
                     ) : (
                        <FaTrashCan className="mr-2 h-3.5 w-3.5" />
                     )}
                     Remover
                  </Button>
               )}
            </div>
            <p className="text-xs text-slate-500">JPG ou PNG, até 5 MB.</p>
         </div>
      </div>
   );
}
