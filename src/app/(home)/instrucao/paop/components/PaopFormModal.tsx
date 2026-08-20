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
   TextInput,
} from "flowbite-react";
import {
   STATUS_PAOP,
   type PaopResumo,
   type StatusPaop,
} from "services/routes/instrucao/paops";
import { STATUS_META } from "./paopUi";

interface PaopFormModalProps {
   show: boolean;
   /** null = criação; o plano existente entra em edição (ano imutável). */
   paop: PaopResumo | null;
   /** Anos que já têm plano — o create não pode repetir. */
   anosOcupados: number[];
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (data: {
      ano: number;
      data_ini: string;
      data_fim: string;
      status: StatusPaop;
   }) => void;
}

function janelaDoAno(ano: number) {
   return { data_ini: `${ano}-01-01`, data_fim: `${ano}-12-31` };
}

export function PaopFormModal({
   show,
   paop,
   anosOcupados,
   isSaving,
   onClose,
   onSubmit,
}: PaopFormModalProps) {
   const [form, setForm] = useState(() => {
      const ano = new Date().getFullYear();
      return { ano, ...janelaDoAno(ano), status: "rascunho" as StatusPaop };
   });

   useEffect(() => {
      if (!show) return;
      if (paop) {
         setForm({
            ano: paop.ano,
            data_ini: paop.data_ini,
            data_fim: paop.data_fim,
            status: paop.status,
         });
         return;
      }
      // Ano novo: o corrente, ou o primeiro seguinte ainda sem plano.
      let ano = new Date().getFullYear();
      while (anosOcupados.includes(ano)) ano += 1;
      setForm({ ano, ...janelaDoAno(ano), status: "rascunho" });
   }, [show, paop, anosOcupados]);

   const editando = paop !== null;
   const anoRepetido = !editando && anosOcupados.includes(form.ano);
   const janelaInvertida = form.data_fim < form.data_ini;
   const podeSalvar =
      !anoRepetido &&
      !janelaInvertida &&
      form.data_ini !== "" &&
      form.data_fim !== "";

   return (
      <Modal show={show} onClose={onClose} size="md">
         <ModalHeader>
            {editando ? `Editar PAOP ${paop.ano}` : "Novo PAOP"}
         </ModalHeader>
         <ModalBody>
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2">
                  <Label htmlFor="paop-ano">Ano</Label>
                  <TextInput
                     id="paop-ano"
                     type="number"
                     min={2000}
                     max={2100}
                     value={form.ano}
                     disabled={editando}
                     color={anoRepetido ? "failure" : "gray"}
                     onChange={(e) => {
                        const ano = Number(e.target.value);
                        setForm((f) => ({ ...f, ano, ...janelaDoAno(ano) }));
                     }}
                  />
                  {anoRepetido && (
                     <p className="text-xs text-red-600">
                        Já existe PAOP para {form.ano}.
                     </p>
                  )}
               </div>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="paop-status">Situação</Label>
                  <Select
                     id="paop-status"
                     value={form.status}
                     onChange={(e) =>
                        setForm((f) => ({
                           ...f,
                           status: e.target.value as StatusPaop,
                        }))
                     }
                  >
                     {STATUS_PAOP.map((status) => (
                        <option key={status} value={status}>
                           {STATUS_META[status].label}
                        </option>
                     ))}
                  </Select>
               </div>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="paop-ini">Início</Label>
                  <TextInput
                     id="paop-ini"
                     type="date"
                     value={form.data_ini}
                     onChange={(e) =>
                        setForm((f) => ({ ...f, data_ini: e.target.value }))
                     }
                  />
               </div>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="paop-fim">Fim</Label>
                  <TextInput
                     id="paop-fim"
                     type="date"
                     value={form.data_fim}
                     color={janelaInvertida ? "failure" : "gray"}
                     onChange={(e) =>
                        setForm((f) => ({ ...f, data_fim: e.target.value }))
                     }
                  />
               </div>

               <p className="col-span-2 text-xs text-slate-500">
                  A janela vem do ano civil por padrão; ajuste se o plano não
                  cobrir o ano inteiro.
               </p>
            </div>
         </ModalBody>
         <ModalFooter>
            <Button
               color="primary"
               disabled={!podeSalvar || isSaving}
               onClick={() => onSubmit(form)}
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
