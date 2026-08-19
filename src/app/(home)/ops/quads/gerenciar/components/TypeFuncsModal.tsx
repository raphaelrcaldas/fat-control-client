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
   const { funcoes } = useFuncoes();
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
      <Modal show={show} onClose={handleClose} size="md">
         <ModalHeader>Funções que concorrem</ModalHeader>
         <ModalBody>
            <p className="mb-4 text-sm text-gray-500">
               Selecione as funções que concorrem ao quadrinho{" "}
               <span className="font-semibold text-gray-700">{typeName}</span>.
            </p>
            <div className="grid grid-cols-2 gap-3">
               {funcoes.map((func) => (
                  <Label
                     key={func.cod}
                     htmlFor={`func-${func.cod}`}
                     className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 px-3 py-2 hover:bg-gray-50"
                  >
                     <Checkbox
                        id={`func-${func.cod}`}
                        color="red"
                        checked={selected.has(func.cod)}
                        onChange={() => toggle(func.cod)}
                     />
                     <span>{func.nome}</span>
                  </Label>
               ))}
            </div>
         </ModalBody>
         <ModalFooter>
            <Button color="red" onClick={handleSubmit} disabled={isSaving}>
               {isSaving ? (
                  <>
                     <Spinner color="primary" size="sm" className="mr-2" />
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
