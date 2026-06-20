import { Button } from "flowbite-react";
import { MdFlightTakeoff, MdDelete } from "react-icons/md";
import { HiPlus } from "react-icons/hi";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import type { Dupla } from "../types";
import { sortEtapas, formatPilotNames } from "../helpers/sessoes";
import SessaoCard from "./SessaoCard";

interface SessoesPanelProps {
   dupla: Dupla | null;
   onAddSessao: () => void;
   onDeleteDupla: (dupla: Dupla) => void;
   onSessaoClick: (etapa: EtapaItem) => void;
}

export default function SessoesPanel({
   dupla,
   onAddSessao,
   onDeleteDupla,
   onSessaoClick,
}: SessoesPanelProps) {
   if (!dupla) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-gray-50 text-gray-400">
            <MdFlightTakeoff className="h-12 w-12 opacity-30" />
            <p className="text-sm">Selecione uma dupla para ver as sessões</p>
         </div>
      );
   }

   const hasSessoes = dupla.etapas.length > 0;

   return (
      <div className="flex flex-1 flex-col overflow-y-auto bg-gray-50">
         {/* Barra de ações da dupla */}
         <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
            <p className="text-sm font-semibold text-gray-900 uppercase">
               <span className="mr-2 text-xs text-slate-400">
                  #{dupla.missaoId}
               </span>
               {formatPilotNames(dupla.pilots)}
            </p>
            <div className="flex items-center gap-2">
               <Button
                  color="red"
                  size="sm"
                  onClick={() => onDeleteDupla(dupla)}
                  disabled={hasSessoes}
                  title={
                     hasSessoes
                        ? "Exclua todas as sessões primeiro"
                        : "Excluir dupla"
                  }
               >
                  <MdDelete className="mr-2 h-4 w-4" />
                  Excluir Dupla
               </Button>
               <Button color="light" size="sm" onClick={onAddSessao}>
                  <HiPlus className="mr-2 h-4 w-4" />
                  Nova Sessão
               </Button>
            </div>
         </div>

         {/* Lista de sessões */}
         <div className="flex-1 px-6 py-3">
            {!hasSessoes ? (
               <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
                  <MdFlightTakeoff className="h-10 w-10 opacity-20" />
                  <p className="text-sm">Nenhuma sessão registrada.</p>
                  <Button color="light" size="sm" onClick={onAddSessao}>
                     <HiPlus className="mr-2 h-4 w-4" />
                     Adicionar primeira sessão
                  </Button>
               </div>
            ) : (
               <div className="flex flex-col gap-2">
                  {sortEtapas(dupla.etapas).map((etapa) => (
                     <SessaoCard
                        key={etapa.id}
                        etapa={etapa}
                        onClick={onSessaoClick}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
