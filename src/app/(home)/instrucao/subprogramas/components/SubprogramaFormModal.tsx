"use client";

import { useEffect, useState } from "react";
import {
   Button,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Select,
   Textarea,
   TextInput,
} from "flowbite-react";
import { useFuncoes } from "@/hooks/queries/useFuncoes";
import {
   CODIGO_SUBPROGRAMA_RE,
   TIPOS_SUBPROGRAMA,
   type Subprograma,
   type SubprogramaUpsert,
} from "services/routes/instrucao/subprogramas";

interface SubprogramaFormModalProps {
   show: boolean;
   /** null = criação; o subprograma existente entra em edição. */
   subprograma: Subprograma | null;
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (data: SubprogramaUpsert) => void;
}

const VAZIO: SubprogramaUpsert = {
   codigo: "",
   descricao: "",
   tipo: "Formação",
   func: "",
   observacoes: null,
};

export function SubprogramaFormModal({
   show,
   subprograma,
   isSaving,
   onClose,
   onSubmit,
}: SubprogramaFormModalProps) {
   // Só as funções não esporádicas: mestre de lançamento e médico não têm
   // programa de instrução próprio — o backend recusa pelo mesmo critério.
   const { principais } = useFuncoes();
   const [form, setForm] = useState(VAZIO);

   useEffect(() => {
      if (!show) return;
      setForm(
         subprograma
            ? {
                 codigo: subprograma.codigo,
                 descricao: subprograma.descricao,
                 tipo: subprograma.tipo,
                 func: subprograma.func,
                 observacoes: subprograma.observacoes,
              }
            : VAZIO
      );
   }, [show, subprograma]);

   const codigoValido = CODIGO_SUBPROGRAMA_RE.test(form.codigo);
   const podeSalvar =
      codigoValido && form.descricao.trim() !== "" && form.func !== "";

   return (
      <Modal show={show} onClose={onClose} size="lg">
         <ModalHeader>
            {subprograma ? `Editar ${subprograma.codigo}` : "Novo subprograma"}
         </ModalHeader>
         <ModalBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
               <div className="flex flex-col gap-2">
                  <Label htmlFor="sub-codigo">Código</Label>
                  <TextInput
                     id="sub-codigo"
                     value={form.codigo}
                     maxLength={7}
                     placeholder="SPFO-01"
                     className="font-mono"
                     color={
                        form.codigo === "" || codigoValido ? "gray" : "failure"
                     }
                     onChange={(e) =>
                        setForm((f) => ({
                           ...f,
                           codigo: e.target.value.toUpperCase(),
                        }))
                     }
                  />
                  <p className="text-xs text-slate-500">
                     4 letras, hífen e 2 dígitos.
                  </p>
               </div>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="sub-tipo">Tipo</Label>
                  <Select
                     id="sub-tipo"
                     value={form.tipo}
                     onChange={(e) =>
                        setForm((f) => ({
                           ...f,
                           tipo: e.target.value as SubprogramaUpsert["tipo"],
                        }))
                     }
                  >
                     {TIPOS_SUBPROGRAMA.map((tipo) => (
                        <option key={tipo} value={tipo}>
                           {tipo}
                        </option>
                     ))}
                  </Select>
               </div>

               <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="sub-descricao">Descrição</Label>
                  <TextInput
                     id="sub-descricao"
                     value={form.descricao}
                     maxLength={120}
                     placeholder="Formação Piloto Operacional C-105"
                     onChange={(e) =>
                        setForm((f) => ({ ...f, descricao: e.target.value }))
                     }
                  />
               </div>

               <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="sub-func">Função</Label>
                  <Select
                     id="sub-func"
                     value={form.func}
                     onChange={(e) =>
                        setForm((f) => ({ ...f, func: e.target.value }))
                     }
                  >
                     <option value="">Selecione a função</option>
                     {principais.map((funcao) => (
                        <option key={funcao.cod} value={funcao.cod}>
                           {funcao.nome}
                        </option>
                     ))}
                  </Select>
                  <p className="text-xs text-slate-500">
                     Só as funções não esporádicas que a unidade opera,
                     definidas em Configurações.
                  </p>
               </div>

               <div className="flex flex-col gap-2 sm:col-span-2">
                  <Label htmlFor="sub-observacoes">Observações</Label>
                  <Textarea
                     id="sub-observacoes"
                     rows={3}
                     value={form.observacoes ?? ""}
                     onChange={(e) =>
                        setForm((f) => ({
                           ...f,
                           observacoes: e.target.value || null,
                        }))
                     }
                  />
               </div>
            </div>
         </ModalBody>
         <ModalFooter>
            <Button
               color="primary"
               disabled={!podeSalvar || isSaving}
               onClick={() =>
                  onSubmit({ ...form, descricao: form.descricao.trim() })
               }
            >
               {isSaving ? "Salvando..." : "Salvar"}
            </Button>
            <Button color="light" onClick={onClose} disabled={isSaving}>
               Cancelar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
