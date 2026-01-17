"use client";
import { Modal, ModalBody, Badge } from "flowbite-react";
import { HiX, HiCalendar } from "react-icons/hi";
import { MisPntsTable } from "./MisPntsTable";

interface MissionRecord {
   user_mis: {
      id: number;
      p_g: string;
      sit: string;
      user: {
         nome_guerra: string;
      };
   };
   missao: {
      id: number;
      tipo_doc: string;
      n_doc: number;
      desc: string;
      afast: string;
      regres: string;
      dias: number;
      diarias: number;
      valor_total: number;
      acrec_desloc: boolean;
      pernoites: any[];
   };
}

interface UserMissionDetailModalProps {
   show: boolean;
   onClose: () => void;
   record: MissionRecord | null;
}

export function UserMissionDetailModal({
   show,
   onClose,
   record,
}: UserMissionDetailModalProps) {
   if (!record) return null;

   const { user_mis, missao } = record;
   const pnts = missao.pernoites || [];

   const afast = new Date(missao.afast).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
   });

   const regres = new Date(missao.regres).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
   });

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
                  <div className="flex items-center gap-4">
                     <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-white/30 bg-white/20 backdrop-blur-sm">
                        <span className="text-[10px] font-medium uppercase">
                           {missao.tipo_doc}
                        </span>
                        <span className="text-lg font-bold">
                           {String(missao.n_doc).padStart(3, "0")}
                        </span>
                     </div>

                     <div>
                        <div className="mb-1 flex items-center gap-2">
                           <h2 className="text-xl font-bold uppercase">
                              {user_mis.p_g} {user_mis.user.nome_guerra}
                           </h2>
                           <Badge
                              color={statusConfig.color}
                              className="shrink-0 text-xs"
                           >
                              {statusConfig.label}
                           </Badge>
                        </div>
                        {missao.desc && (
                           <span className="text-sm font-semibold text-red-100">
                              {missao.desc}
                           </span>
                        )}
                     </div>
                  </div>

                  {/* Datas */}
                  <div className="flex flex-wrap items-center gap-4">
                     <div className="flex items-center gap-2 rounded bg-white/20 px-3 py-2 text-sm backdrop-blur-sm">
                        <HiCalendar className="h-4 w-4" />
                        <div className="flex flex-col">
                           <span className="text-[10px] text-red-100">
                              Afastamento
                           </span>
                           <span className="font-medium">{afast}</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 rounded bg-white/20 px-3 py-2 text-sm backdrop-blur-sm">
                        <HiCalendar className="h-4 w-4" />
                        <div className="flex flex-col">
                           <span className="text-[10px] text-red-100">
                              Regresso
                           </span>
                           <span className="font-medium">{regres}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <ModalBody className="flex-1 overflow-y-auto p-4">
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
