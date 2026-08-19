"use client";

import { useEffect, useState } from "react";
import {
   Button,
   Checkbox,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Select,
   TextInput,
} from "flowbite-react";
import clsx from "clsx";
import { FUNC_CORES, getFuncColors } from "@/constants/tripulantes/funcoes";
import type { Funcao, FuncaoUpsert } from "services/routes/funcs";

interface FuncaoFormModalProps {
   show: boolean;
   /** null = criação; a função existente entra em edição (código imutável). */
   funcao: Funcao | null;
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (data: FuncaoUpsert & { cod: string }) => void;
}

const VAZIO: FuncaoUpsert & { cod: string } = {
   cod: "",
   nome: "",
   nome_curto: "",
   cor: "gray",
   ordem: 1,
   esporadica: false,
   active: true,
};

export function FuncaoFormModal({
   show,
   funcao,
   isSaving,
   onClose,
   onSubmit,
}: FuncaoFormModalProps) {
   const [form, setForm] = useState(VAZIO);

   useEffect(() => {
      if (!show) return;
      setForm(
         funcao
            ? {
                 cod: funcao.cod,
                 nome: funcao.nome,
                 nome_curto: funcao.nome_curto,
                 cor: funcao.cor,
                 ordem: funcao.ordem,
                 esporadica: funcao.esporadica,
                 active: funcao.active,
              }
            : VAZIO
      );
   }, [show, funcao]);

   const editando = funcao !== null;
   const codValido = /^[a-z]{2,3}$/.test(form.cod.trim().toLowerCase());
   const podeSalvar =
      form.nome.trim() !== "" && form.nome_curto.trim() !== "" && codValido;

   return (
      <Modal show={show} onClose={onClose} size="md">
         <ModalHeader>
            {editando ? `Editar função ${funcao.cod}` : "Nova função"}
         </ModalHeader>
         <ModalBody>
            <div className="grid grid-cols-2 gap-4">
               <div className="flex flex-col gap-2">
                  <Label htmlFor="func-cod">Código</Label>
                  <TextInput
                     id="func-cod"
                     value={form.cod}
                     maxLength={3}
                     disabled={editando}
                     placeholder="pil"
                     color={form.cod === "" || codValido ? "gray" : "failure"}
                     onChange={(e) =>
                        setForm((f) => ({
                           ...f,
                           cod: e.target.value.toLowerCase(),
                        }))
                     }
                  />
                  <p className="text-xs text-slate-500">
                     2 a 3 letras. É a chave usada no tripulante — não muda
                     depois de criada.
                  </p>
               </div>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="func-ordem">Ordem</Label>
                  <TextInput
                     id="func-ordem"
                     type="number"
                     min={0}
                     max={99}
                     value={form.ordem}
                     onChange={(e) =>
                        setForm((f) => ({
                           ...f,
                           ordem: Number(e.target.value),
                        }))
                     }
                  />
               </div>

               <div className="col-span-2 flex flex-col gap-2">
                  <Label htmlFor="func-nome">Nome</Label>
                  <TextInput
                     id="func-nome"
                     value={form.nome}
                     placeholder="Piloto"
                     onChange={(e) =>
                        setForm((f) => ({ ...f, nome: e.target.value }))
                     }
                  />
               </div>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="func-curto">Nome curto</Label>
                  <TextInput
                     id="func-curto"
                     value={form.nome_curto}
                     placeholder="Obs-SAR"
                     onChange={(e) =>
                        setForm((f) => ({ ...f, nome_curto: e.target.value }))
                     }
                  />
               </div>

               <div className="flex flex-col gap-2">
                  <Label htmlFor="func-cor">Cor</Label>
                  <div className="flex items-center gap-2">
                     <Select
                        id="func-cor"
                        className="flex-1"
                        value={form.cor}
                        onChange={(e) =>
                           setForm((f) => ({ ...f, cor: e.target.value }))
                        }
                     >
                        {FUNC_CORES.map((cor) => (
                           <option key={cor} value={cor}>
                              {cor}
                           </option>
                        ))}
                     </Select>
                     <span
                        aria-hidden
                        className={clsx(
                           "size-9 shrink-0 rounded-md",
                           getFuncColors(form.cor).bar
                        )}
                     />
                  </div>
               </div>

               <Label
                  htmlFor="func-esporadica"
                  className="col-span-2 flex cursor-pointer items-center gap-2"
               >
                  <Checkbox
                     id="func-esporadica"
                     color="primary"
                     checked={form.esporadica}
                     onChange={() =>
                        setForm((f) => ({ ...f, esporadica: !f.esporadica }))
                     }
                  />
                  <span className="text-sm text-slate-700">
                     Função esporádica (sem controle de posição a bordo)
                  </span>
               </Label>

               <Label
                  htmlFor="func-active"
                  className="col-span-2 flex cursor-pointer items-center gap-2"
               >
                  <Checkbox
                     id="func-active"
                     color="primary"
                     checked={form.active}
                     onChange={() =>
                        setForm((f) => ({ ...f, active: !f.active }))
                     }
                  />
                  <span className="text-sm text-slate-700">
                     Ativa (disponível para as unidades escolherem)
                  </span>
               </Label>
            </div>
         </ModalBody>
         <ModalFooter>
            <Button
               color="primary"
               disabled={!podeSalvar || isSaving}
               onClick={() =>
                  onSubmit({ ...form, cod: form.cod.trim().toLowerCase() })
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
