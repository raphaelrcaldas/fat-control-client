"use client";

import { useEffect, useState } from "react";
import {
   Modal,
   ModalHeader,
   ModalBody,
   ModalFooter,
   Button,
   Checkbox,
   Label,
   Spinner,
} from "flowbite-react";
import { useFuncoes } from "@/hooks/queries";

interface TypeFuncsModalProps {
   show: boolean;
   typeName: string;
   initialFuncs: string[];
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (funcs: string[]) => void;
}

export function TypeFuncsModal({
   show,
   typeName,
   initialFuncs,
   isSaving,
   onClose,
   onSubmit,
}: TypeFuncsModalProps) {
   // Só concorre ao quadrinho função que a unidade opera — é o que o
   // backend valida no PUT.
   const { funcoes, isLoading, isError } = useFuncoes();
   // Sem catálogo não há o que enviar: o PUT substitui a lista inteira, e um
   // `[]` vindo de catálogo vazio apagaria as funções do quadrinho.
   const semCatalogo = isLoading || isError || funcoes.length === 0;
   // Associada ao quadrinho mas fora do catálogo da unidade: não aparece na
   // grade e o salvar a descarta (o backend a rejeitaria). Avisar antes.
   const foraDoCatalogo = semCatalogo
      ? []
      : initialFuncs.filter((cod) => !funcoes.some((f) => f.cod === cod));
   const [selected, setSelected] = useState<Set<string>>(new Set());

   useEffect(() => {
      if (show) setSelected(new Set(initialFuncs));
   }, [show, initialFuncs]);

   const toggle = (func: string) => {
      setSelected((prev) => {
         const next = new Set(prev);
         if (next.has(func)) {
            next.delete(func);
         } else {
            next.add(func);
         }
         return next;
      });
   };

   const handleClose = () => {
      if (!isSaving) onClose();
   };

   const handleSubmit = () => {
      // Mantém a ordem canônica das funções.
      const ordered = funcoes
         .map((f) => f.cod)
         .filter((cod) => selected.has(cod));
      onSubmit(ordered);
   };

   return (
      <Modal
         show={show}
         onClose={handleClose}
         size="md"
         dismissible={!isSaving}
      >
         <ModalHeader>Funções que concorrem</ModalHeader>
         <ModalBody className="space-y-4">
            <p className="text-sm text-slate-500">
               Selecione as funções que concorrem ao quadrinho{" "}
               <span className="font-semibold text-slate-700 uppercase">
                  {typeName}
               </span>
               .
            </p>
            {foraDoCatalogo.length > 0 && (
               <p className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  A unidade não opera mais{" "}
                  <span className="font-mono font-semibold uppercase">
                     {foraDoCatalogo.join(", ")}
                  </span>
                  . Ao salvar, deixa(m) de concorrer a este quadrinho.
               </p>
            )}
            {isError ? (
               <p className="text-sm text-red-700" role="alert">
                  Não foi possível carregar as funções da unidade.
               </p>
            ) : isLoading ? (
               <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                     <div
                        key={i}
                        className="h-[38px] animate-pulse rounded bg-slate-100"
                     />
                  ))}
               </div>
            ) : funcoes.length === 0 ? (
               <p className="text-sm text-slate-500">
                  A unidade não opera nenhuma função. Configure-as em
                  Configurações.
               </p>
            ) : (
               <div className="grid grid-cols-2 gap-3">
                  {funcoes.map((func) => (
                     <Label
                        key={func.cod}
                        htmlFor={`func-${func.cod}`}
                        className="flex min-w-0 cursor-pointer items-center gap-2 rounded border border-slate-200 px-3 py-2 hover:bg-slate-50"
                     >
                        <Checkbox
                           id={`func-${func.cod}`}
                           color="primary"
                           checked={selected.has(func.cod)}
                           onChange={() => toggle(func.cod)}
                        />
                        <span className="truncate" title={func.nome}>
                           {func.nome}
                        </span>
                     </Label>
                  ))}
               </div>
            )}
         </ModalBody>
         <ModalFooter>
            <Button
               color="primary"
               onClick={handleSubmit}
               disabled={isSaving || semCatalogo}
            >
               {isSaving ? (
                  <>
                     <Spinner size="sm" className="mr-2" />
                     Salvando...
                  </>
               ) : (
                  "Salvar"
               )}
            </Button>
            <Button color="gray" onClick={onClose} disabled={isSaving}>
               Cancelar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
