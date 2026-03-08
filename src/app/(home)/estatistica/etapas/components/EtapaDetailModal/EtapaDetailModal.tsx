"use client";

import { Modal, ModalBody, Spinner } from "flowbite-react";
import { HiX, HiCalendar, HiAnnotation } from "react-icons/hi";
import { FaUsers, FaWeightHanging, FaGasPump, FaOilCan } from "react-icons/fa";
import { GoDatabase } from "react-icons/go";
import { CiPaperplane } from "react-icons/ci";
import { MdFlightLand, MdAirplanemodeActive, MdLayers } from "react-icons/md";
import { useEtapaDetail } from "@/hooks/queries";
import { formatDateFull } from "@/../utils/dateHandler";
import { RouteVisualization } from "./RouteVisualization";
import { StatCard } from "./StatCard";
import { TripulantesByFunc } from "./TripulantesByFunc";
import { SectionTitle } from "./SectionTitle";
import { OIEtapasList } from "./OIEtapasList";

interface EtapaDetailModalProps {
   etapaId: number | null;
   onClose: () => void;
}

export function EtapaDetailModal({ etapaId, onClose }: EtapaDetailModalProps) {
   const { data, isLoading } = useEtapaDetail(etapaId);

   return (
      <Modal
         show={etapaId !== null}
         onClose={onClose}
         dismissible
         size="5xl"
         popup
      >
         <div className="relative flex max-h-[90vh] flex-col">
            {isLoading || !data ? (
               <div className="flex justify-center py-20">
                  <Spinner color="failure" size="xl" />
               </div>
            ) : (
               <>
                  <div className="shrink-0 rounded-t-lg border-b border-slate-300 bg-slate-100 px-6 pt-5 pb-4 text-slate-800">
                     <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-10 rounded-lg p-1.5 transition-colors hover:bg-white/10"
                     >
                        <HiX className="h-5 w-5 text-slate-800" />
                     </button>

                     <div className="mb-4 flex flex-wrap items-center gap-2">
                        <div className="px-2.5 py-1 font-mono text-xs font-bold">
                           #{data.id}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-medium">
                           <HiCalendar className="size-5" />
                           {formatDateFull(data.data)}
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md bg-white/10 px-2.5 py-1 font-semibold">
                           <MdAirplanemodeActive className="size-5" />
                           FAB {data.anv}
                        </div>
                     </div>

                     <RouteVisualization
                        origem={data.origem}
                        destino={data.destino}
                        dep={data.dep}
                        arr={data.arr}
                        tvoo={data.tvoo}
                     />
                  </div>

                  <ModalBody className="flex-1 overflow-y-auto bg-gray-50/50 p-5">
                     {(!data.sagem || !data.parte1) && (
                        <div className="mb-5 flex flex-col gap-2">
                           {!data.sagem && (
                              <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-800">
                                 <span className="text-base">&#9888;</span>
                                 NÃO REGISTRADO NO SAGEM
                              </div>
                           )}
                           {!data.parte1 && (
                              <div className="flex items-center gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-3 py-2 text-sm font-semibold text-yellow-800">
                                 <span className="text-base">&#9888;</span>
                                 RELATÓRIO NÃO RECOLHIDO
                              </div>
                           )}
                        </div>
                     )}

                     <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                        <div className="col-span-2 space-y-5">
                           {data.obs && (
                              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                 <HiAnnotation className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                 <p className="text-sm leading-relaxed text-slate-600">
                                    {data.obs}
                                 </p>
                              </div>
                           )}

                           <div className="space-y-3">
                              <SectionTitle
                                 icon={<GoDatabase className="h-4 w-4" />}
                                 title="Dados do Voo"
                                 color="blue"
                              />
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                 <StatCard
                                    icon={<MdFlightLand className="h-4 w-4" />}
                                    label="Pousos"
                                    value={data.pousos}
                                    accent="blue"
                                 />
                                 <StatCard
                                    icon={<MdLayers className="h-4 w-4" />}
                                    label="Nivel"
                                    value={data.nivel}
                                    accent="cyan"
                                 />
                                 <StatCard
                                    icon={
                                       <FaWeightHanging className="h-3.5 w-3.5" />
                                    }
                                    label="TOW (kg)"
                                    value={data.tow}
                                    accent="gray"
                                 />
                                 <StatCard
                                    icon={<FaUsers className="h-3.5 w-3.5" />}
                                    label="PAX"
                                    value={data.pax}
                                    accent="emerald"
                                 />
                                 <StatCard
                                    icon={<MdLayers className="h-4 w-4" />}
                                    label="Carga (kg)"
                                    value={data.carga}
                                    accent="amber"
                                 />
                                 <StatCard
                                    icon={<FaGasPump className="h-3.5 w-3.5" />}
                                    label="Comb (L)"
                                    value={data.comb}
                                    accent="red"
                                 />
                                 <StatCard
                                    icon={<FaOilCan className="h-3.5 w-3.5" />}
                                    label="Lub (L)"
                                    value={data.lub}
                                    accent="purple"
                                 />
                              </div>
                           </div>

                           {data.oi_etapas.length > 0 && (
                              <div className="space-y-3">
                                 <SectionTitle
                                    icon={<CiPaperplane className="h-4 w-4" />}
                                    title="Missão"
                                    color="amber"
                                 />
                                 <OIEtapasList items={data.oi_etapas} />
                              </div>
                           )}
                        </div>

                        <div className="space-y-3">
                           <div className="flex items-center justify-between">
                              <SectionTitle
                                 icon={<FaUsers className="h-4 w-4" />}
                                 title="Tripulantes"
                                 color="emerald"
                              />
                              {data.tripulantes.length > 0 && (
                                 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                    {data.tripulantes.length} total
                                 </span>
                              )}
                           </div>
                           <TripulantesByFunc tripulantes={data.tripulantes} />
                        </div>
                     </div>
                  </ModalBody>
               </>
            )}
         </div>
      </Modal>
   );
}
