"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
   Modal,
   ModalBody,
   ModalHeader,
   ModalFooter,
   Button,
} from "flowbite-react";
import { HiX, HiUserGroup } from "react-icons/hi";
import { useToast } from "@/app/context/toast";
import { useCreateMissao } from "@/hooks/queries/useEtapas";
import { MAX_PILOTOS, type DuplaPilot, type CrewSearchResult } from "../types";
import PilotSearchInput from "./PilotSearchInput";

interface CreateDuplaModalProps {
   show: boolean;
   onClose: () => void;
   onCreated: (missaoId: number, pilots: DuplaPilot[]) => void;
}

export default function CreateDuplaModal({
   show,
   onClose,
   onCreated,
}: CreateDuplaModalProps) {
   const { push } = useToast();
   const createMissao = useCreateMissao();

   const [pilots, setPilots] = useState<DuplaPilot[]>([]);

   const assignedIds = useMemo(
      () => new Set(pilots.map((p) => p.trip_id)),
      [pilots]
   );

   // Reset ao abrir
   useEffect(() => {
      if (show) setPilots([]);
   }, [show]);

   const addPilot = useCallback((crew: CrewSearchResult) => {
      setPilots((prev) => {
         if (prev.length >= MAX_PILOTOS) return prev;
         return [
            ...prev,
            {
               trip_id: crew.id,
               trig: crew.trig,
               nome_guerra: crew.nome_guerra,
               p_g: crew.p_g,
               func: "pil",
               func_bordo: prev.length === 0 ? "1P" : "2P",
            },
         ];
      });
   }, []);

   const removePilot = useCallback((tripId: number) => {
      setPilots((prev) => prev.filter((p) => p.trip_id !== tripId));
   }, []);

   async function handleCreate() {
      if (pilots.length === 0) return;

      try {
         const res = await createMissao.mutateAsync({
            titulo: "Simulador",
            is_simulador: true,
         });
         if (!res.ok || !res.data) {
            push({
               title: "Erro",
               message: res.message ?? "Erro ao criar dupla",
               type: "error",
            });
            return;
         }

         onCreated(res.data.id, pilots);
         push({
            title: "Sucesso!",
            message: "Dupla criada. Adicione sessões de simulador.",
            type: "success",
         });
         onClose();
      } catch (err) {
         push({
            title: "Erro",
            message: err instanceof Error ? err.message : "Erro ao criar dupla",
            type: "error",
         });
      }
   }

   return (
      <Modal show={show} size="lg" onClose={onClose} dismissible>
         <ModalHeader>
            <div className="flex items-center gap-3">
               <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600">
                  <HiUserGroup className="h-5 w-5 text-white" />
               </div>
               <div>
                  <p className="text-base font-semibold text-gray-900">
                     Nova Dupla de Simulador
                  </p>
                  <p className="text-sm font-normal text-gray-400">
                     Selecione os pilotos que voarão juntos
                  </p>
               </div>
            </div>
         </ModalHeader>

         <ModalBody>
            <div className="overflow-visible rounded border border-slate-200 bg-gray-50 p-4 shadow-sm">
               <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold tracking-widest text-gray-600 uppercase">
                     Pilotos
                  </p>
                  <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                     {pilots.length} / {MAX_PILOTOS}
                  </span>
               </div>

               {pilots.length < MAX_PILOTOS && (
                  <div className="mb-3">
                     <PilotSearchInput
                        assignedIds={assignedIds}
                        onSelect={addPilot}
                        placeholder="Buscar piloto por trigrama ou nome..."
                     />
                  </div>
               )}

               {/* Slots de pilotos */}
               <div className="space-y-2">
                  {Array.from({ length: MAX_PILOTOS }).map((_, i) => {
                     const pilot = pilots[i];
                     return pilot ? (
                        <div
                           key={pilot.trip_id}
                           className="flex items-center gap-3 rounded border border-red-200 bg-red-50/60 px-4 py-3 uppercase"
                        >
                           <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-900">
                                 {pilot.p_g} {pilot.nome_guerra}
                              </p>
                           </div>
                           <button
                              type="button"
                              onClick={() => removePilot(pilot.trip_id)}
                              className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
                           >
                              <HiX className="h-4 w-4" />
                           </button>
                        </div>
                     ) : (
                        <div
                           key={`empty-${i}`}
                           className="flex items-center justify-center rounded border-2 border-dashed border-slate-200 px-4 py-4 text-xs text-gray-400"
                        >
                           {i === 0 ? "1º Piloto" : "2º Piloto (opcional)"}
                        </div>
                     );
                  })}
               </div>
            </div>
         </ModalBody>

         <ModalFooter>
            <div className="flex w-full justify-end gap-2">
               <Button color="gray" onClick={onClose}>
                  Cancelar
               </Button>
               <Button
                  color="blue"
                  onClick={handleCreate}
                  disabled={pilots.length === 0 || createMissao.isPending}
               >
                  {createMissao.isPending ? "Criando..." : "Criar Dupla"}
               </Button>
            </div>
         </ModalFooter>
      </Modal>
   );
}
