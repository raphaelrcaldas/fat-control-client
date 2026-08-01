"use client";

import { HiAnnotation, HiCalendar, HiOutlineCube } from "react-icons/hi";
import { FaUsers, FaWeightHanging, FaGasPump, FaOilCan } from "react-icons/fa";
import { GoDatabase } from "react-icons/go";
import { CiPaperplane } from "react-icons/ci";
import { MdFlightLand, MdAirplanemodeActive, MdLayers } from "react-icons/md";
import type { EtapaItem } from "services/routes/estatistica/etapas";
import { formatDateFull } from "@/../utils/dateHandler";
import { RouteVisualization } from "./RouteVisualization";
import { StatCard } from "./StatCard";
import { TripulantesByFunc } from "./TripulantesByFunc";
import { SectionTitle } from "./SectionTitle";
import { OIEtapasList } from "./OIEtapasList";
import { EspecificosList } from "./EspecificosList";

interface EtapaDetailContentProps {
   /**
    * A listagem (`GET /estatistica/etapas`) ja devolve o mesmo shape do
    * detalhe — inclusive OIs, tripulantes e missoes especificas. O painel
    * recebe a etapa por prop em vez de refazer a busca por id: sem
    * request extra e sem estado de carregamento.
    */
   etapa: EtapaItem;
}

export function EtapaDetailContent({ etapa }: EtapaDetailContentProps) {
   return (
      <div className="flex h-full flex-col rounded">
         <div className="shrink-0 border-b border-slate-200 bg-white px-3 pt-3 pb-3 text-slate-800 sm:px-6 sm:pt-5 sm:pb-4">
            <div className="mb-3 flex flex-wrap items-center gap-2 sm:mb-4">
               <span className="text-primary-600 font-mono text-sm font-bold">
                  #{etapa.id}
               </span>
               <div className="bg-primary-200 h-4 w-px" />
               <div className="bg-primary-100 flex items-center gap-1.5 rounded px-2.5 py-1 font-medium text-slate-700">
                  <HiCalendar className="text-primary-700 size-5" />
                  {formatDateFull(etapa.data)}
               </div>
               <div className="bg-primary-100 flex items-center gap-1.5 rounded px-2.5 py-1 font-semibold text-slate-700">
                  <MdAirplanemodeActive className="text-primary-700 size-5" />
                  FAB {etapa.anv}
               </div>
            </div>

            <RouteVisualization
               origem={etapa.origem}
               destino={etapa.destino}
               dep={etapa.dep}
               arr={etapa.arr}
               tvoo={etapa.tvoo}
            />
         </div>

         {/* tabIndex/role: a regiao rola, e regiao rolavel sem foco por
             teclado reprova o scrollable-region-focusable do axe */}
         <div
            tabIndex={0}
            role="region"
            aria-label="Detalhes da etapa"
            className="flex-1 overflow-y-auto bg-gray-50/50 p-3 sm:p-5"
         >
            {(!etapa.sagem || !etapa.parte1) && (
               <div className="mb-5 flex flex-col gap-2">
                  {!etapa.sagem && (
                     <div className="flex items-center gap-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                        <span className="text-base">&#9888;</span>
                        NÃO REGISTRADO NO SAGEM
                     </div>
                  )}
                  {!etapa.parte1 && (
                     <div className="flex items-center gap-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
                        <span className="text-base">&#9888;</span>
                        RELATÓRIO NÃO RECOLHIDO
                     </div>
                  )}
               </div>
            )}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
               <div className="col-span-2 space-y-5">
                  {etapa.obs && (
                     <div className="flex items-start gap-2.5 rounded border border-slate-200 bg-slate-50 px-4 py-3">
                        <HiAnnotation className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <p className="text-sm leading-relaxed text-slate-600">
                           {etapa.obs}
                        </p>
                     </div>
                  )}

                  <div className="space-y-3">
                     <SectionTitle
                        icon={<GoDatabase className="h-4 w-4" />}
                        title="Dados do Voo"
                        color="primary"
                     />
                     <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <StatCard
                           icon={<FaUsers className="h-3.5 w-3.5" />}
                           label="PAX"
                           value={etapa.pax}
                           accent="emerald"
                        />
                        <StatCard
                           icon={<MdLayers className="h-4 w-4" />}
                           label="Carga (kg)"
                           value={etapa.carga}
                           accent="amber"
                        />
                        <StatCard
                           icon={<FaGasPump className="h-3.5 w-3.5" />}
                           label="Comb (L)"
                           value={etapa.comb}
                           accent="red"
                        />
                        <StatCard
                           icon={<FaOilCan className="h-3.5 w-3.5" />}
                           label="Lub (L)"
                           value={etapa.lub}
                           accent="purple"
                        />

                        <StatCard
                           icon={<MdLayers className="h-4 w-4" />}
                           label="Nivel"
                           value={etapa.nivel}
                           accent="cyan"
                        />
                        <StatCard
                           icon={<FaWeightHanging className="h-3.5 w-3.5" />}
                           label="TOW (kg)"
                           value={etapa.tow}
                           accent="gray"
                        />
                        <StatCard
                           icon={<MdFlightLand className="h-4 w-4" />}
                           label="Pousos"
                           value={etapa.pousos}
                           accent="blue"
                        />
                     </div>
                  </div>

                  {etapa.oi_etapas.length > 0 && (
                     <div className="space-y-3">
                        <SectionTitle
                           icon={<CiPaperplane className="h-4 w-4" />}
                           title="Missão"
                           color="primary"
                        />
                        <OIEtapasList items={etapa.oi_etapas} />
                     </div>
                  )}

                  {(etapa.pqd.length > 0 ||
                     etapa.revo.length > 0 ||
                     etapa.heavy_cds.length > 0) && (
                     <div className="space-y-3">
                        <SectionTitle
                           icon={<HiOutlineCube className="h-4 w-4" />}
                           title="Missões Específicas"
                           color="primary"
                        />
                        <EspecificosList
                           pqd={etapa.pqd}
                           revo={etapa.revo}
                           heavyCds={etapa.heavy_cds}
                        />
                     </div>
                  )}
               </div>

               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                     <SectionTitle
                        icon={<FaUsers className="h-4 w-4" />}
                        title="Tripulantes"
                        color="primary"
                     />
                     {etapa.tripulantes.length > 0 && (
                        <span className="bg-primary-100 text-primary-700 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                           {etapa.tripulantes.length} total
                        </span>
                     )}
                  </div>
                  <TripulantesByFunc tripulantes={etapa.tripulantes} />
               </div>
            </div>
         </div>
      </div>
   );
}
