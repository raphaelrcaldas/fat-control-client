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
import { FaPlus, FaTrashCan } from "react-icons/fa6";
import type { Funcao, FuncaoPosicaoInput } from "services/routes/funcs";

interface PosicoesModalProps {
   show: boolean;
   funcao: Funcao | null;
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (posicoes: FuncaoPosicaoInput[]) => void;
}

const TIPOS: FuncaoPosicaoInput["tipo"][] = ["titular", "instrutor", "aluno"];

/**
 * Posições a bordo de uma função ('1P', 'IN', 'AC'...).
 *
 * O conjunto é substituído inteiro no salvamento — é o mesmo contrato do
 * `PUT /admin/funcoes/{cod}/posicoes`. A ordem das linhas é a ordem de
 * exibição nos seletores de etapa.
 */
export function PosicoesModal({
   show,
   funcao,
   isSaving,
   onClose,
   onSubmit,
}: PosicoesModalProps) {
   const [linhas, setLinhas] = useState<FuncaoPosicaoInput[]>([]);

   useEffect(() => {
      if (!show || !funcao) return;
      setLinhas(
         funcao.posicoes.map((p) => ({
            cod: p.cod,
            nome: p.nome,
            descricao: p.descricao,
            tipo: p.tipo,
            ordem: p.ordem,
         }))
      );
   }, [show, funcao]);

   function atualizar(index: number, patch: Partial<FuncaoPosicaoInput>) {
      setLinhas((prev) =>
         prev.map((linha, i) => (i === index ? { ...linha, ...patch } : linha))
      );
   }

   const codigos = linhas.map((l) => l.cod.trim().toUpperCase());
   const temVazio = linhas.some(
      (l) => l.cod.trim() === "" || l.nome.trim() === ""
   );
   const temRepetido = new Set(codigos).size !== codigos.length;

   return (
      <Modal show={show} onClose={onClose} size="2xl">
         <ModalHeader>Posições a bordo — {funcao?.nome ?? ""}</ModalHeader>
         <ModalBody>
            <div className="space-y-2">
               {linhas.length === 0 && (
                  <p className="py-6 text-center text-sm text-slate-500">
                     Nenhuma posição cadastrada.
                  </p>
               )}

               {linhas.map((linha, index) => (
                  <div
                     key={index}
                     className="flex flex-wrap items-end gap-2 rounded border border-slate-200 p-2"
                  >
                     <div className="w-20">
                        <Label htmlFor={`pos-cod-${index}`} className="text-xs">
                           Código
                        </Label>
                        <TextInput
                           id={`pos-cod-${index}`}
                           sizing="sm"
                           maxLength={2}
                           value={linha.cod}
                           onChange={(e) =>
                              atualizar(index, {
                                 cod: e.target.value.toUpperCase(),
                              })
                           }
                        />
                     </div>

                     <div className="min-w-40 flex-1">
                        <Label
                           htmlFor={`pos-nome-${index}`}
                           className="text-xs"
                        >
                           Nome
                        </Label>
                        <TextInput
                           id={`pos-nome-${index}`}
                           sizing="sm"
                           value={linha.nome}
                           onChange={(e) =>
                              atualizar(index, { nome: e.target.value })
                           }
                        />
                     </div>

                     <div className="w-32">
                        <Label
                           htmlFor={`pos-tipo-${index}`}
                           className="text-xs"
                        >
                           Tipo
                        </Label>
                        <Select
                           id={`pos-tipo-${index}`}
                           sizing="sm"
                           value={linha.tipo}
                           onChange={(e) =>
                              atualizar(index, {
                                 tipo: e.target
                                    .value as FuncaoPosicaoInput["tipo"],
                              })
                           }
                        >
                           {TIPOS.map((tipo) => (
                              <option key={tipo} value={tipo}>
                                 {tipo}
                              </option>
                           ))}
                        </Select>
                     </div>

                     <div className="min-w-40 flex-1">
                        <Label
                           htmlFor={`pos-desc-${index}`}
                           className="text-xs"
                        >
                           Descrição
                        </Label>
                        <TextInput
                           id={`pos-desc-${index}`}
                           sizing="sm"
                           value={linha.descricao ?? ""}
                           onChange={(e) =>
                              atualizar(index, { descricao: e.target.value })
                           }
                        />
                     </div>

                     <Button
                        size="xs"
                        color="red"
                        onClick={() =>
                           setLinhas((prev) =>
                              prev.filter((_, i) => i !== index)
                           )
                        }
                        title="Remover posição"
                     >
                        <FaTrashCan className="size-3.5" />
                     </Button>
                  </div>
               ))}

               <Button
                  size="xs"
                  color="light"
                  onClick={() =>
                     setLinhas((prev) => [
                        ...prev,
                        {
                           cod: "",
                           nome: "",
                           descricao: "",
                           tipo: "titular",
                           ordem: prev.length + 1,
                        },
                     ])
                  }
               >
                  <FaPlus className="mr-1 size-3" />
                  Adicionar posição
               </Button>

               {temRepetido && (
                  <p className="text-xs font-semibold text-red-600">
                     Há códigos repetidos — cada posição da função precisa de um
                     código único.
                  </p>
               )}
            </div>
         </ModalBody>
         <ModalFooter>
            <Button
               color="primary"
               disabled={isSaving || temVazio || temRepetido}
               onClick={() =>
                  onSubmit(
                     linhas.map((linha, index) => ({
                        ...linha,
                        cod: linha.cod.trim().toUpperCase(),
                        descricao: linha.descricao?.trim() || null,
                        ordem: index + 1,
                     }))
                  )
               }
            >
               {isSaving ? "Salvando..." : "Salvar posições"}
            </Button>
            <Button color="light" onClick={onClose} disabled={isSaving}>
               Cancelar
            </Button>
         </ModalFooter>
      </Modal>
   );
}
