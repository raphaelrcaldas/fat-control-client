"use client";

import { useState } from "react";
import {
   Modal,
   ModalBody,
   ModalHeader,
   ModalFooter,
   Button,
   Spinner,
} from "flowbite-react";
import { MdFlightTakeoff } from "react-icons/md";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import { MAX_PILOTOS, type DuplaPilot } from "../types";
import { useSessaoForm } from "../hooks/useSessaoForm";
import PilotSearchDropdown from "./PilotSearchDropdown";
import SessaoDadosFields from "./SessaoDadosFields";
import SessaoOrdemInstrucaoFields from "./SessaoOrdemInstrucaoFields";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

interface AddSessaoModalProps {
   show: boolean;
   onClose: () => void;
   missaoId: number;
   anoRef: number;
   pilots: DuplaPilot[];
   editEtapa?: EtapaItem | null;
   onDelete?: (etapa: EtapaItem) => void;
   onPersistDraft?: (newMissaoId: number) => void;
}

export default function AddSessaoModal({
   show,
   onClose,
   missaoId,
   anoRef,
   pilots,
   editEtapa = null,
   onDelete,
   onPersistDraft,
}: AddSessaoModalProps) {
   const isOrphan = pilots.length === 0;
   const [confirmDelete, setConfirmDelete] = useState(false);

   const form = useSessaoForm({
      show,
      missaoId,
      anoRef,
      pilots,
      editEtapa,
      onClose,
      onPersistDraft,
   });
   const { isEditMode } = form;

   const pilotNames =
      form.sessionPilots.length > 0
         ? form.sessionPilots
              .map((p) => `${p.p_g} ${p.nome_guerra}`)
              .join(" / ")
              .toUpperCase()
         : "Sem pilotos";

   return (
      <>
         <Modal show={show} size="2xl" onClose={onClose} dismissible>
            <ModalHeader>
               <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-600">
                     <MdFlightTakeoff className="h-5 w-5 text-white" />
                  </div>
                  <div>
                     <p className="text-base font-semibold text-gray-900">
                        {isEditMode
                           ? "Editar Sessão"
                           : "Nova Sessão de Simulador"}
                     </p>
                     <p className="text-sm font-normal text-gray-400">
                        {pilotNames}
                     </p>
                  </div>
               </div>
            </ModalHeader>

            <ModalBody>
               {form.isLoadingData ? (
                  <div className="flex items-center justify-center py-16">
                     <Spinner size="lg" color="primary" />
                  </div>
               ) : (
                  <form
                     id="sessao-form"
                     onSubmit={form.handleSubmit}
                     className="space-y-5"
                  >
                     {/* ── Tripulação ─────────────────────────────── */}
                     <div className="rounded border border-slate-200 bg-gray-50 p-4 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                           <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                              {form.sessionPilots.length} / {MAX_PILOTOS}
                           </span>
                        </div>

                        <PilotSearchDropdown
                           pilots={form.sessionPilots}
                           onAdd={form.addPilot}
                           onRemove={form.removePilot}
                           onUpdateFuncBordo={form.updateFuncBordo}
                           showSearch={isOrphan}
                        />
                     </div>

                     {/* ── Dados da Sessão ────────────────────────── */}
                     <SessaoDadosFields form={form} />

                     {/* ── Ordem de Instrução ─────────────────────── */}
                     <SessaoOrdemInstrucaoFields form={form} />
                  </form>
               )}
            </ModalBody>

            {!form.isLoadingData && (
               <ModalFooter>
                  <div className="flex w-full items-center">
                     {isEditMode && onDelete && (
                        <Button
                           color="red"
                           size="sm"
                           onClick={() => setConfirmDelete(true)}
                        >
                           Excluir Sessão
                        </Button>
                     )}
                     <div className="ml-auto flex gap-2">
                        <Button color="gray" onClick={onClose}>
                           Cancelar
                        </Button>
                        <Button
                           type="submit"
                           form="sessao-form"
                           color="blue"
                           disabled={!form.canSubmit}
                        >
                           {form.isPending
                              ? "Salvando..."
                              : isEditMode
                                ? "Salvar Alterações"
                                : "Criar Sessão"}
                        </Button>
                     </div>
                  </div>
               </ModalFooter>
            )}
         </Modal>

         <ConfirmDeleteModal
            show={confirmDelete}
            onClose={() => setConfirmDelete(false)}
            onConfirm={() => {
               if (onDelete && editEtapa) onDelete(editEtapa);
               setConfirmDelete(false);
            }}
         />
      </>
   );
}
