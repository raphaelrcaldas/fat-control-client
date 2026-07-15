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
import { TODAS_FUNCOES, getFuncLabel } from "@/constants";
import type { FuncType } from "@/constants";

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
      const ordered = TODAS_FUNCOES.filter((f) => selected.has(f));
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
               {TODAS_FUNCOES.map((func: FuncType) => (
                  <Label
                     key={func}
                     htmlFor={`func-${func}`}
                     className="flex cursor-pointer items-center gap-2 rounded border border-slate-200 px-3 py-2 hover:bg-gray-50"
                  >
                     <Checkbox
                        id={`func-${func}`}
                        color="red"
                        checked={selected.has(func)}
                        onChange={() => toggle(func)}
                     />
                     <span>{getFuncLabel(func)}</span>
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
