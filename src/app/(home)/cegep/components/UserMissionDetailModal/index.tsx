"use client";
import { Modal, ModalBody, Badge } from "flowbite-react";
import { HiX, HiCalendar, HiExclamation, HiCheckCircle } from "react-icons/hi";
import { MisPntsTable } from "./MisPntsTable";
import { PagamentoRecord } from "services/routes/cegep/financeiro";
import { formatNaiveDateTime } from "utils/dateHandler";

interface UserMissionDetailModalProps {
   show: boolean;
   onClose: () => void;
   record: PagamentoRecord | null;
}

export function UserMissionDetailModal({
   show,
   onClose,
   record,
}: UserMissionDetailModalProps) {
   if (!record) return null;

   const { user_mis, missao } = record;
   const pnts = missao.pernoites || [];

   const afast = formatNaiveDateTime(missao.afast);
   const regres = formatNaiveDateTime(missao.regres);

   const getStatusConfig = (sit: string) => {
      const configs = {
         g: { label: "Grat. Representação", color: "warning" },
         d: { label: "Diária", color: "success" },
         c: { label: "Comissionado", color: "info" },
      };
      return configs[sit] || configs.g;
   };

   const statusConfig = getStatusConfig(user_mis.sit);

   return (
      <Modal show={show} size="6xl" onClose={onClose} dismissible popup>
         <div className="relative flex max-h-[90vh] flex-col">
            {/* Header */}
            <div className="shrink-0 rounded-t-lg bg-linear-to-r from-red-500 to-red-700 p-4 text-white">
               <button
                  onClick={onClose}
                  className="absolute top-3 right-3 z-10 rounded-lg p-1.5 transition-colors hover:bg-white/20"
                  aria-label="Fechar"
               >
                  <HiX className="h-5 w-5" />
               </button>

               <div className="mr-10 flex flex-wrap items-start justify-between gap-4">
                  {/* Documento e Militar */}
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                     <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-white/30 bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-medium uppercase">
                           {missao.tipo_doc}
                        </span>
                        <span className="text-lg font-bold">
                           {missao.n_doc}
                        </span>
                     </div>

                     <div className="min-w-0">
                        <div className="mb-1 flex min-w-0 items-center justify-start gap-2">
                           <h2 className="min-w-0 text-xl font-bold uppercase">
                              {user_mis.p_g} {user_mis.user.nome_guerra}
                           </h2>
                           <Badge
                              color={statusConfig.color}
                              className="text-xs"
                           >
                              {statusConfig.label}
                           </Badge>
                        </div>
                        {missao.desc && (
                           <span className="w-96 truncate text-sm font-semibold text-red-100">
                              {missao.desc}
                           </span>
                        )}
                     </div>
                  </div>

                  {/* Datas */}
                  <div className="flex shrink-0 flex-wrap items-center gap-4">
                     <div className="flex items-center gap-2 rounded bg-white/20 px-3 py-2 text-sm">
                        <HiCalendar className="h-4 w-4" />
                        <div className="flex flex-col">
                           <span className="text-[10px] text-red-100">
                              Afastamento
                           </span>
                           <span className="font-mono">{afast}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 rounded bg-white/20 px-3 py-2 text-sm">
                        <HiCalendar className="h-4 w-4" />
                        <div className="flex flex-col">
                           <span className="text-[10px] text-red-100">
                              Regresso
                           </span>
                           <span className="font-mono">{regres}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <ModalBody className="flex-1 overflow-y-auto p-4">
               {missao.custo_inconsistente && (
                  <div className="mb-4 flex items-start gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                     <HiExclamation className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-red-500" />
                     <span>
                        Integridade comprometida: os valores desta missão podem
                        estar desatualizados.
                     </span>
                  </div>
               )}
               <MisPntsTable
                  pernoites={pnts}
                  acDeslocSede={missao.acrec_desloc}
                  total={missao.valor_total}
               />
            </ModalBody>
         </div>
      </Modal>
   );
}
