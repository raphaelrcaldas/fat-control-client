"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useTrips } from "@/hooks/queries/useTrips";
import { useFuncoes } from "@/hooks/queries/useFuncoes";
import type { PaopSubprogramaItem } from "services/routes/instrucao/paops";

interface MatriculaModalProps {
   show: boolean;
   item: PaopSubprogramaItem | null;
   isSaving: boolean;
   onClose: () => void;
   onSubmit: (tripIds: number[]) => void;
}

// A unidade inteira de uma função cabe numa página só; paginar aqui só
// esconderia gente de quem está montando a turma.
const TODOS = 200;

export function MatriculaModal({
   show,
   item,
   isSaving,
   onClose,
   onSubmit,
}: MatriculaModalProps) {
   const { label } = useFuncoes();
   const func = item?.subprograma.func;

   // Mesmo recorte que o backend exige na matrícula: ativos da org, da
   // função do subprograma.
   const { data, isLoading } = useTrips(
      { func: func ? [func] : [], active: true, per_page: TODOS },
      show && !!func
   );

   const [marcados, setMarcados] = useState<number[]>([]);
   const [busca, setBusca] = useState("");

   useEffect(() => {
      if (!show || !item) return;
      setMarcados(item.tripulantes.map((t) => t.trip_id));
      setBusca("");
   }, [show, item]);

   const elegiveis = useMemo(
      () =>
         (data?.items ?? []).filter(
            (t): t is typeof t & { id: number } => t.id !== undefined
         ),
      [data]
   );

   const candidatos = useMemo(() => {
      const termo = busca.trim().toLowerCase();
      if (termo === "") return elegiveis;
      return elegiveis.filter(
         (t) =>
            t.trig.toLowerCase().includes(termo) ||
            t.user.nome_guerra.toLowerCase().includes(termo) ||
            (t.user.nome_completo ?? "").toLowerCase().includes(termo)
      );
   }, [elegiveis, busca]);

   // Quem foi matriculado e depois saiu do critério (inativado, transferido,
   // trocou de função) não aparece entre os candidatos. Sem listá-lo aqui o
   // operador não teria como desmarcá-lo — e o vínculo ficaria preso.
   const foraDoCriterio = useMemo(() => {
      if (!item || isLoading) return [];
      const ids = new Set(elegiveis.map((t) => t.id));
      return item.tripulantes.filter((t) => !ids.has(t.trip_id));
   }, [item, elegiveis, isLoading]);

   // O backend pagina; se a unidade tiver mais tripulantes numa função do que
   // cabe na página, a lista silenciaria o excedente.
   const truncado = (data?.total ?? 0) > elegiveis.length;

   function alternar(id: number) {
      setMarcados((atual) =>
         atual.includes(id) ? atual.filter((x) => x !== id) : [...atual, id]
      );
   }

   return (
      <Modal show={show} onClose={onClose} size="lg">
         <ModalHeader>
            {item ? `Matrículas — ${item.subprograma.codigo}` : "Matrículas"}
         </ModalHeader>
         <ModalBody>
            <div className="space-y-3">
               <p className="text-xs text-slate-500">
                  Só tripulantes ativos da função{" "}
                  <strong className="text-slate-700">
                     {func ? label(func) : ""}
                  </strong>
                  , que é a do subprograma.
               </p>

               <TextInput
                  icon={IoMdSearch}
                  placeholder="buscar por trigrama ou nome…"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  sizing="sm"
               />

               {truncado && (
                  <p className="rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
                     Mostrando {elegiveis.length} de {data?.total} tripulantes
                     desta função. Use a busca para achar quem não aparece.
                  </p>
               )}

               {foraDoCriterio.length > 0 && (
                  <div className="space-y-1 rounded border border-amber-300 bg-amber-50 p-2">
                     <p className="text-xs text-amber-800">
                        Matriculado(s) que não atendem mais ao critério
                        (inativo, transferido ou de outra função). Permanecem no
                        subprograma até serem desmarcados.
                     </p>
                     <ul className="space-y-1">
                        {foraDoCriterio.map((trip) => (
                           <li key={trip.trip_id}>
                              <Label
                                 htmlFor={`trip-fora-${trip.trip_id}`}
                                 className="flex cursor-pointer items-center gap-3 rounded border border-amber-200 bg-white p-2"
                              >
                                 <Checkbox
                                    id={`trip-fora-${trip.trip_id}`}
                                    color="primary"
                                    checked={marcados.includes(trip.trip_id)}
                                    onChange={() => alternar(trip.trip_id)}
                                 />
                                 <span className="font-mono text-sm font-bold text-slate-800 uppercase">
                                    {trip.trig}
                                 </span>
                                 <span className="min-w-0 flex-1 truncate text-sm text-slate-700 uppercase">
                                    {trip.p_g} {trip.nome_guerra}
                                 </span>
                              </Label>
                           </li>
                        ))}
                     </ul>
                  </div>
               )}

               {isLoading ? (
                  <div className="flex justify-center py-8">
                     <Spinner color="primary" />
                  </div>
               ) : candidatos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-500">
                     {busca.trim() === ""
                        ? "Nenhum tripulante dessa função na unidade."
                        : "Nenhum tripulante para essa busca."}
                  </p>
               ) : (
                  <ul className="max-h-[50vh] space-y-1 overflow-y-auto">
                     {candidatos.map((trip) => (
                        <li key={trip.id}>
                           <Label
                              htmlFor={`trip-${trip.id}`}
                              className="flex cursor-pointer items-center gap-3 rounded border border-slate-200 p-2 hover:bg-slate-50"
                           >
                              <Checkbox
                                 id={`trip-${trip.id}`}
                                 color="primary"
                                 checked={marcados.includes(trip.id)}
                                 onChange={() => alternar(trip.id)}
                              />
                              <span className="font-mono text-sm font-bold text-slate-800 uppercase">
                                 {trip.trig}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm text-slate-700 uppercase">
                                 {trip.user.p_g} {trip.user.nome_guerra}
                              </span>
                           </Label>
                        </li>
                     ))}
                  </ul>
               )}

               <p className="text-xs text-slate-500 tabular-nums">
                  {marcados.length} matriculado
                  {marcados.length === 1 ? "" : "s"}
               </p>
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
