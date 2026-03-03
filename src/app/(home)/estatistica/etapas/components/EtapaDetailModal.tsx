"use client";

import clsx from "clsx";
import { Modal, ModalBody, Spinner } from "flowbite-react";
import { HiX, HiCalendar, HiMoon, HiSun, HiAnnotation } from "react-icons/hi";
import { GiOwl } from "react-icons/gi";
import {
   FaPlaneDeparture,
   FaPlaneArrival,
   FaUsers,
   FaWeightHanging,
   FaGasPump,
   FaOilCan,
   FaClock,
} from "react-icons/fa";
import { GoDatabase } from "react-icons/go";
import { CiPaperplane } from "react-icons/ci";
import { MdFlightLand, MdAirplanemodeActive, MdLayers } from "react-icons/md";
import { useEtapaDetail } from "@/hooks/queries";
import { formatDateFull, minutesToTime } from "@/../utils/dateHandler";
import {
   FUNC_COLORS,
   FUNCOES_CONFIG,
   FUNCOES_PRINCIPAIS,
   type FuncType,
} from "@/constants/tripulantes/funcoes";
import type {
   TripEtapaItem,
   OIEtapaItem,
} from "services/routes/estatistica/etapas";

interface EtapaDetailModalProps {
   etapaId: number | null;
   onClose: () => void;
}

function formatTime(timeStr: string): string {
   return timeStr.slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  Visualizacao de rota (padrao aviacao)                              */
/* ------------------------------------------------------------------ */

function RouteVisualization({
   origem,
   destino,
   dep,
   arr,
   tvoo,
}: {
   origem: string;
   destino: string;
   dep: string;
   arr: string;
   tvoo: number;
}) {
   return (
      <div className="flex items-center gap-3">
         {/* Origem */}
         <div className="text-center">
            <p className="text-2xl font-black tracking-wider uppercase sm:text-3xl">
               {origem}
            </p>
            <div className="mt-1 flex items-center justify-center gap-1.5">
               <FaPlaneDeparture className="size-4" />
               <span className="font-mono font-semibold">
                  {formatTime(dep)}Z
               </span>
            </div>
         </div>

         {/* Linha de rota */}
         <div className="flex flex-1 flex-col items-center gap-1">
            <div className="relative flex w-full items-center">
               <div className="border-slate/80 h-px flex-1 border-t border-dashed" />
               <div className="mx-1 flex items-center justify-center gap-2 rounded-lg bg-white p-2 font-semibold shadow">
                  <FaClock /> {minutesToTime(tvoo)}
               </div>
               <div className="border-slate/80 h-px flex-1 border-t border-dashed" />
            </div>
         </div>

         {/* Destino */}
         <div className="text-center">
            <p className="text-2xl font-black tracking-wider uppercase sm:text-3xl">
               {destino}
            </p>
            <div className="mt-1 flex items-center justify-center gap-1.5">
               <FaPlaneArrival className="size-4" />
               <span className="font-mono font-semibold">
                  {formatTime(arr)}Z
               </span>
            </div>
         </div>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Stat card compacto                                                 */
/* ------------------------------------------------------------------ */

interface StatCardProps {
   icon: React.ReactNode;
   label: string;
   value: React.ReactNode;
   accent?: string;
}

const ACCENT_STYLES: Record<string, { card: string; iconBg: string }> = {
   gray: {
      card: "border-gray-200 bg-gray-50/50",
      iconBg: "bg-gray-100 text-gray-600",
   },
   blue: {
      card: "border-blue-200 bg-blue-50/50",
      iconBg: "bg-blue-100 text-blue-600",
   },
   amber: {
      card: "border-amber-200 bg-amber-50/50",
      iconBg: "bg-amber-100 text-amber-600",
   },
   emerald: {
      card: "border-emerald-200 bg-emerald-50/50",
      iconBg: "bg-emerald-100 text-emerald-600",
   },
   red: {
      card: "border-red-200 bg-red-50/50",
      iconBg: "bg-red-100 text-red-600",
   },
   cyan: {
      card: "border-cyan-200 bg-cyan-50/50",
      iconBg: "bg-cyan-100 text-cyan-600",
   },
   purple: {
      card: "border-purple-200 bg-purple-50/50",
      iconBg: "bg-purple-100 text-purple-600",
   },
};

function StatCard({ icon, label, value, accent = "gray" }: StatCardProps) {
   const styles = ACCENT_STYLES[accent] ?? ACCENT_STYLES.gray;
   return (
      <div
         className={clsx(
            "flex items-center gap-2.5 rounded-xl border px-1.5 py-1 shadow-sm",
            styles.card
         )}
      >
         <div
            className={clsx(
               "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
               styles.iconBg
            )}
         >
            {icon}
         </div>
         <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-wide text-gray-500 uppercase">
               {label}
            </p>
            <p className="truncate font-mono text-sm font-bold text-gray-900">
               {value ?? <span className="text-gray-300">&mdash;</span>}
            </p>
         </div>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Tripulantes agrupados por funcao                                   */
/* ------------------------------------------------------------------ */

function TripulantesByFunc({ tripulantes }: { tripulantes: TripEtapaItem[] }) {
   const grouped = new Map<string, TripEtapaItem[]>();
   for (const t of tripulantes) {
      const list = grouped.get(t.func) ?? [];
      list.push(t);
      grouped.set(t.func, list);
   }

   const orderedFuncs = [
      ...FUNCOES_PRINCIPAIS,
      ...Array.from(grouped.keys()).filter(
         (f) =>
            !FUNCOES_PRINCIPAIS.includes(
               f as (typeof FUNCOES_PRINCIPAIS)[number]
            )
      ),
   ].filter((f) => grouped.has(f));

   if (orderedFuncs.length === 0) {
      return (
         <div className="rounded-xl border border-dashed border-gray-200 py-8 text-center">
            <FaUsers className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-400">
               Nenhum tripulante registrado
            </p>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-3">
         {orderedFuncs.map((func) => {
            const config = FUNCOES_CONFIG[func as FuncType];
            const members = grouped.get(func)!;
            const themeColor = config?.theme.color ?? "gray";
            const colors = FUNC_COLORS[themeColor] ?? FUNC_COLORS.gray;

            return (
               <div
                  key={func}
                  className={clsx(
                     "overflow-hidden rounded-xl border",
                     colors.border
                  )}
               >
                  {/* Barra de cor no topo */}
                  <div className={clsx("h-1", colors.bar)} />
                  <div className={clsx("p-3", colors.bg)}>
                     <div className="mb-2.5 flex items-center justify-between">
                        <span
                           className={clsx(
                              "text-xs font-bold tracking-wide uppercase",
                              colors.text
                           )}
                        >
                           {config?.label ?? func}
                        </span>
                        <span
                           className={clsx(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              colors.badge
                           )}
                        >
                           {members.length}
                        </span>
                     </div>
                     <div className="space-y-1">
                        {members.map((m, i) => (
                           <div
                              key={i}
                              className="flex items-center gap-2 rounded-lg bg-white/80 px-2.5 py-2 shadow-sm"
                           >
                              <div
                                 className={clsx(
                                    "flex h-7 w-7 items-center justify-center rounded-md px-4 text-xs font-bold uppercase",
                                    colors.badge
                                 )}
                              >
                                 {m.trig}
                              </div>
                              <div className="min-w-0 flex-1">
                                 <p className="text-xs font-semibold text-gray-800 uppercase">
                                    {m.p_g} {m.nome_guerra}
                                 </p>
                              </div>
                              <span
                                 className={clsx(
                                    "rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase",
                                    colors.badge
                                 )}
                              >
                                 {m.func_bordo || m.func}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            );
         })}
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Section header                                                     */
/* ------------------------------------------------------------------ */

function SectionTitle({
   icon,
   title,
   color = "blue",
}: {
   icon: React.ReactNode;
   title: string;
   color?: string;
}) {
   const barColors: Record<string, string> = {
      blue: "bg-blue-500",
      amber: "bg-amber-500",
      red: "bg-red-500",
      emerald: "bg-emerald-500",
   };
   const iconColors: Record<string, string> = {
      blue: "text-blue-500",
      amber: "text-amber-500",
      red: "text-red-500",
      emerald: "text-emerald-500",
   };

   return (
      <div className="flex items-center gap-2">
         <div
            className={clsx(
               "h-4 w-1 rounded-full",
               barColors[color] ?? barColors.blue
            )}
         />
         <span
            className={clsx("h-4 w-4", iconColors[color] ?? iconColors.blue)}
         >
            {icon}
         </span>
         <h3 className="text-xs font-bold tracking-wider text-gray-700 uppercase">
            {title}
         </h3>
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  OI Etapas detalhadas                                               */
/* ------------------------------------------------------------------ */

const REG_CONFIG: Record<
   string,
   { label: string; icon: typeof HiSun; color: string }
> = {
   d: { label: "Diurno", icon: HiSun, color: "text-amber-500" },
   n: { label: "Noturno", icon: HiMoon, color: "text-indigo-500" },
   v: { label: "NVG", icon: GiOwl, color: "text-emerald-500" },
};

function OIEtapasList({ items }: { items: OIEtapaItem[] }) {
   if (items.length === 0) return null;

   return (
      <div className="space-y-2">
         {items.map((oi, i) => {
            const reg = REG_CONFIG[oi.reg];
            const RegIcon = reg?.icon ?? HiSun;

            return (
               <div
                  key={i}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm"
               >
                  {/* Regime (d/n/v) */}
                  <div className="flex items-center gap-1.5">
                     <RegIcon
                        className={clsx(
                           "h-4 w-4",
                           reg?.color ?? "text-gray-500"
                        )}
                     />
                     <span className="w-12 text-center text-xs font-bold text-gray-700">
                        {reg?.label ?? oi.reg}
                     </span>
                  </div>

                  {/* Separador */}
                  <div className="h-4 w-px bg-gray-200" />

                  {/* Tempo de voo da OI */}
                  <div className="flex items-center justify-center gap-1.5">
                     <FaClock className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                     <span className="font-mono text-sm font-bold text-gray-900">
                        {minutesToTime(oi.tvoo)}
                     </span>
                  </div>

                  {/* Separador */}
                  <div className="h-4 w-px bg-gray-200" />

                  {/* COD Missao */}
                  <span className="w-16 rounded-md bg-slate-100 px-2 py-1 text-center text-xs font-bold tracking-wider text-slate-800 uppercase">
                     {oi.tipo_missao_cod}
                  </span>

                  {/* Esforco Aereo */}
                  <span
                     className={clsx(
                        "rounded-lg border px-2.5 py-1 text-xs font-semibold",
                        oi.esf_aer.includes("COMAE")
                           ? "border-blue-200 bg-blue-50 text-blue-700"
                           : oi.esf_aer.includes("COMPREP")
                             ? "border-amber-200 bg-amber-50 text-amber-700"
                             : "border-gray-200 bg-gray-50 text-gray-700"
                     )}
                  >
                     {oi.esf_aer}
                  </span>
               </div>
            );
         })}
      </div>
   );
}

/* ------------------------------------------------------------------ */
/*  Modal principal                                                    */
/* ------------------------------------------------------------------ */

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
                  {/* ============================================= */}
                  {/* HEADER — Gradiente com visualizacao de rota    */}
                  {/* ============================================= */}
                  <div className="shrink-0 rounded-t-lg border-b border-slate-300 bg-slate-100 px-6 pt-5 pb-4 text-slate-800">
                     <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-10 rounded-lg p-1.5 transition-colors hover:bg-white/10"
                     >
                        <HiX className="h-5 w-5 text-slate-800" />
                     </button>

                     {/* Linha superior: id + data + aeronave + cod missao */}
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

                     {/* Visualizacao da rota */}
                     <RouteVisualization
                        origem={data.origem}
                        destino={data.destino}
                        dep={data.dep}
                        arr={data.arr}
                        tvoo={data.tvoo}
                     />
                  </div>

                  {/* ============================================= */}
                  {/* BODY                                           */}
                  {/* ============================================= */}
                  <ModalBody className="flex-1 overflow-y-auto bg-gray-50/50 p-5">
                     {/* Alertas — largura total */}
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
                        {/* ── COLUNA ESQUERDA ── */}
                        <div className="col-span-2 space-y-5">
                           {/* Obs */}
                           {data.obs && (
                              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                 <HiAnnotation className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                 <p className="text-sm leading-relaxed text-slate-600">
                                    {data.obs}
                                 </p>
                              </div>
                           )}

                           {/* Dados do voo */}
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

                           {/* OI Etapas */}
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

                        {/* ── COLUNA DIREITA — Tripulantes ── */}
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
