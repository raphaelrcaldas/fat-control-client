"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
   Button,
   Checkbox,
   Label,
   Modal,
   ModalBody,
   ModalFooter,
   ModalHeader,
   Spinner,
   TextInput,
} from "flowbite-react";
import { IoMdSearch } from "react-icons/io";
import { useSubprogramas } from "@/hooks/queries/useSubprogramas";
import {
   FuncBadge,
   TipoBadge,
} from "../../subprogramas/components/SubprogramaBadges";

interface PaopSubprogramasModalProps {
   show: boolean;
   ano: number;
   /** Subprogramas já no plano. */
   selecionadosIniciais: number[];
   /** Com matrícula: o backend recusa a remoção, então nem oferece. */
   bloqueados: number[];
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (subprogramaIds: number[]) => void;
}

export function PaopSubprogramasModal({
   show,
   ano,
   selecionadosIniciais,
   bloqueados,
   isSaving,
   onClose,
   onSubmit,
}: PaopSubprogramasModalProps) {
   const { data: subprogramas = [], isLoading } = useSubprogramas();
   const [marcados, setMarcados] = useState<number[]>([]);
   const [busca, setBusca] = useState("");

   // Só a abertura semeia as marcações. `selecionadosIniciais` é array novo a
   // cada render do pai, então depender dele zeraria o que o usuário marcou
   // em qualquer re-render com a modal aberta.
   const iniciaisRef = useRef(selecionadosIniciais);
   iniciaisRef.current = selecionadosIniciais;

   useEffect(() => {
      if (!show) return;
      setMarcados(iniciaisRef.current);
      setBusca("");
   }, [show]);

   const filtrados = useMemo(() => {
      const termo = busca.trim().toLowerCase();
      if (termo === "") return subprogramas;
      return subprogramas.filter(
         (s) =>
            s.codigo.toLowerCase().includes(termo) ||
            s.descricao.toLowerCase().includes(termo)
      );
   }, [subprogramas, busca]);

   function alternar(id: number) {
      setMarcados((atual) =>
         atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
      );
   }

   return (
      <Modal show={show} onClose={onClose} size="2xl">
         <ModalHeader>Subprogramas do PAOP {ano}</ModalHeader>
         <ModalBody>
            <div className="space-y-3">
               <TextInput
                  icon={IoMdSearch}
                  placeholder="buscar por código ou descrição…"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  sizing="sm"
               />

               {isLoading ? (
                  <div className="flex justify-center py-8">
                     <Spinner color="primary" />
                  </div>
               ) : subprogramas.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                     A unidade ainda não tem subprograma cadastrado.
                  </p>
               ) : filtrados.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                     Nenhum subprograma para essa busca.
                  </p>
               ) : (
                  <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
                     {filtrados.map((subprograma) => {
                        const bloqueado = bloqueados.includes(subprograma.id);
                        return (
                           <li key={subprograma.id}>
                              <Label
                                 htmlFor={`sp-${subprograma.id}`}
                                 className="flex cursor-pointer items-center gap-3 rounded border border-slate-200 p-2 hover:bg-slate-50"
                              >
                                 <Checkbox
                                    id={`sp-${subprograma.id}`}
                                    color="primary"
                                    checked={marcados.includes(subprograma.id)}
                                    disabled={bloqueado}
                                    onChange={() => alternar(subprograma.id)}
                                 />
                                 <span className="font-mono text-sm font-bold whitespace-nowrap text-slate-800">
                                    {subprograma.codigo}
                                 </span>
                                 <span className="min-w-0 flex-1 truncate text-sm text-slate-700">
                                    {subprograma.descricao}
                                 </span>
                                 <TipoBadge tipo={subprograma.tipo} />
                                 <FuncBadge func={subprograma.func} />
                              </Label>
                              {bloqueado && (
                                 <p className="mt-0.5 ml-9 text-xs text-slate-500">
                                    Tem tripulante matriculado — desmatricule
                                    antes de tirar do plano.
                                 </p>
                              )}
                           </li>
                        );
                     })}
                  </ul>
               )}
            </div>
         </ModalBody>
         <ModalFooter>
            <Button
               color="primary"
               disabled={isSaving || isLoading}
               onClick={() => onSubmit(marcados)}
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
