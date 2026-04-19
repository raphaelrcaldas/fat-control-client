import { memo, useMemo, useCallback } from "react";
import { HiDocumentDuplicate, HiTrash, HiClock } from "react-icons/hi";
import type { OrdemMissaoList, EtapaListItem } from "services/routes/om/ordens";
import { Label } from "flowbite-react";
import { extractDate } from "utils/dateHandler";
import {
   STATUS_CONFIG as statusConfig,
   type StatusType,
} from "@/constants/ops/ordens-missao/status";
import { PermBased } from "@/app/(home)/hooks/usePermBased";

interface ListaOrdensProps {
   ordens: OrdemMissaoList[];
   onOrdemClick: (ordem: OrdemMissaoList) => void;
   onCloneOrdem: (ordem: OrdemMissaoList) => void;
   onDeleteOrdem?: (ordem: OrdemMissaoList) => void;
}

interface OrdemItemProps {
   ordem: OrdemMissaoList;
   onOrdemClick: (ordem: OrdemMissaoList) => void;
   onCloneOrdem: (ordem: OrdemMissaoList) => void;
   onDeleteOrdem?: (ordem: OrdemMissaoList) => void;
}

function gerarResumoRota(
   ordem: OrdemMissaoList
): Record<string, EtapaListItem[]> {
   if (!ordem.etapas || ordem.etapas.length === 0) return {};

   // Agrupar etapas por data
   const etapasPorData = ordem.etapas.reduce(
      (acc, etapa) => {
         if (!etapa.dt_dep) return acc;
         const dateStr = extractDate(etapa.dt_dep);
         const [year, month, day] = dateStr.split("-");
         const data = `${day}/${month}`;
         if (!acc[data]) acc[data] = [];
         acc[data].push(etapa);

         return acc;
      },
      {} as Record<string, EtapaListItem[]>
   );

   return etapasPorData;
}

// Componente memoizado para cada item da lista
const OrdemItem = memo(function OrdemItem({
   ordem,
   onOrdemClick,
   onCloneOrdem,
   onDeleteOrdem,
}: OrdemItemProps) {
   const resumoRota = useMemo(() => gerarResumoRota(ordem), [ordem]);

   const handleClick = useCallback(() => {
      onOrdemClick(ordem);
   }, [onOrdemClick, ordem]);

   const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
         if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOrdemClick(ordem);
         }
      },
      [onOrdemClick, ordem]
   );

   const handleClone = useCallback(
      (e: React.MouseEvent) => {
         e.stopPropagation();
         onCloneOrdem(ordem);
      },
      [onCloneOrdem, ordem]
   );

   const handleDelete = useCallback(
      (e: React.MouseEvent) => {
         e.stopPropagation();
         onDeleteOrdem?.(ordem);
      },
      [onDeleteOrdem, ordem]
   );

   return (
      <div
         role="button"
         tabIndex={0}
         aria-label={`Abrir ordem de missão ${ordem.numero}`}
         className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-red-300 hover:shadow-md focus:border-red-400 focus:ring-2 focus:ring-red-400 focus:outline-none"
         onClick={handleClick}
         onKeyDown={handleKeyDown}
      >
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="flex flex-col gap-1.5 text-center">
                  <Label className="pointer-events-none text-start text-xs text-gray-500">
                     Número
                  </Label>
                  <div className="pointer-events-none font-mono text-lg font-semibold text-gray-900">
                     {ordem.numero}
                  </div>
               </div>
               <div className="h-10 w-px bg-gray-200" />
               <div className="hidden w-24 flex-col gap-1.5 text-center md:flex">
                  <Label className="pointer-events-none text-xs text-gray-500">
                     Status
                  </Label>
                  <span
                     className={`pointer-events-none text-xs font-bold uppercase ${statusConfig[ordem.status as StatusType]?.text ?? "text-gray-500"}`}
                  >
                     {ordem.status}
                  </span>
               </div>
               <div className="hidden h-10 w-px bg-gray-200 md:block" />
               <div className="hidden w-32 flex-col gap-1.5 text-center md:flex">
                  <Label className="pointer-events-none text-xs text-gray-500">
                     Etiquetas
                  </Label>
                  {ordem.etiquetas && ordem.etiquetas.length > 0 ? (
                     ordem.etiquetas.map((et) => (
                        <span
                           key={et.id}
                           className="pointer-events-none inline-flex items-center justify-center border px-1.5 py-0.5 text-[10px] font-bold tracking-tight uppercase shadow-xs"
                           style={
                              {
                                 "--tag-color": et.cor,
                                 backgroundColor: `color-mix(in srgb, var(--tag-color) 12%, transparent)`,
                                 color: "var(--tag-color)",
                                 borderColor: "var(--tag-color)",
                              } as React.CSSProperties
                           }
                        >
                           {et.nome}
                        </span>
                     ))
                  ) : (
                     <span className="pointer-events-none text-xs text-gray-400">
                        Nenhuma etiqueta
                     </span>
                  )}
               </div>
               <div className="hidden h-10 w-px bg-gray-200 md:block" />
               <div className="hidden flex-col gap-1.5 md:flex">
                  <Label className="pointer-events-none text-xs text-gray-500">
                     Documento Referência
                  </Label>
                  <p className="pointer-events-none hidden w-48 text-sm sm:block">
                     <span
                        className={
                           ordem.doc_ref ? "text-gray-600" : "text-gray-400"
                        }
                     >
                        {ordem.doc_ref || "Sem documento"}
                     </span>
                  </p>
               </div>
               <div className="hidden h-10 w-px bg-gray-200 md:block" />
               <div className="hidden flex-col gap-1.5 md:flex">
                  <Label className="pointer-events-none text-xs text-gray-500">
                     Descrição
                  </Label>
                  <p className="pointer-events-none w-48 truncate text-sm">
                     <span
                        className={
                           ordem.tipo ? "text-gray-600" : "text-gray-400"
                        }
                     >
                        {ordem.tipo || "Sem descrição"}
                     </span>
                  </p>
               </div>
               <div className="hidden h-10 w-px bg-gray-200 md:block" />

               <div className="flex flex-col gap-1.5">
                  {/* <Label className="pointer-events-none text-xs text-gray-500">
                     Rota
                  </Label> */}
                  {Object.keys(resumoRota).length > 0 && (
                     <div className="flex flex-col gap-2">
                        {Object.entries(resumoRota).map(([data, etapas]) => (
                           <div key={data} className="text-sm font-medium">
                              <span className="mr-2 rounded border border-slate-400 bg-gray-200 px-2 py-1 font-mono text-gray-700">
                                 {data}
                              </span>
                              <span className="font-mono">
                                 {etapas.map((e) => e.origem).join(" ")}{" "}
                                 {etapas[etapas.length - 1].dest}
                              </span>
                           </div>
                        ))}
                     </div>
                  )}
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1">
                  <PermBased resource={"ordem_missao"} requiredPerm={"create"}>
                     <button
                        onClick={handleClone}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                        title="Clonar missao"
                     >
                        <HiDocumentDuplicate size={20} />
                     </button>
                  </PermBased>
                  {onDeleteOrdem && ordem.status === "rascunho" && (
                     <PermBased
                        resource={"ordem_missao"}
                        requiredPerm={"delete"}
                     >
                        <button
                           onClick={handleDelete}
                           className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                           title="Excluir rascunho"
                        >
                           <HiTrash size={20} />
                        </button>
                     </PermBased>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
});

export const ListaOrdens = memo(function ListaOrdens({
   ordens,
   onOrdemClick,
   onCloneOrdem,
   onDeleteOrdem,
}: ListaOrdensProps) {
   const sortedOrdens = useMemo(() => {
      return [...ordens].sort((a, b) => {
         // 1. Ano da data_saida (descendente)
         const anoA = a.data_saida ? new Date(a.data_saida).getFullYear() : 0;
         const anoB = b.data_saida ? new Date(b.data_saida).getFullYear() : 0;

         if (anoA !== anoB) return anoB - anoA;

         // 2. Número da ordem (descendente)
         // Se for 'auto', tratamos como 0 ou similar
         const numA =
            a.numero && a.numero !== "auto" ? parseInt(a.numero, 10) : 0;
         const numB =
            b.numero && b.numero !== "auto" ? parseInt(b.numero, 10) : 0;

         if (numA !== numB) return numB - numA;

         // 3. Data/hora de última modificação ou criação (descendente)
         const momentA = new Date(a.updated_at || a.created_at || 0).getTime();
         const momentB = new Date(b.updated_at || b.created_at || 0).getTime();

         return momentB - momentA;
      });
   }, [ordens]);

   if (ordens.length === 0) {
      return (
         <div className="rounded-xl border border-gray-200 bg-white py-16 text-center text-gray-400">
            <p className="mb-4 text-4xl">✈</p>
            <p className="text-lg text-gray-600">
               Nenhuma ordem de missão encontrada
            </p>
            <p className="text-sm">Ajuste os filtros ou crie uma nova ordem</p>
         </div>
      );
   }

   return (
      <div className="space-y-2">
         {sortedOrdens.map((ordem) => (
            <OrdemItem
               key={ordem.id}
               ordem={ordem}
               onOrdemClick={onOrdemClick}
               onCloneOrdem={onCloneOrdem}
               onDeleteOrdem={onDeleteOrdem}
            />
         ))}
      </div>
   );
});
