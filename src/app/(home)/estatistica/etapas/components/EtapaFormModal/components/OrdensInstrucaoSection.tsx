import clsx from "clsx";
import { HiPlus, HiX } from "react-icons/hi";
import { Label } from "flowbite-react";
import { minutesToTime, timeToMinutes } from "@/../utils/dateHandler";
import { SearchableSelect } from "@/components/SearchableSelect";
import type { OIItem } from "../types";

interface OrdensInstrucaoSectionProps {
   oiItems: OIItem[];
   addOiItem: () => void;
   removeOiItem: (uid: string) => void;
   updateOiItem: (uid: string, patch: Partial<OIItem>) => void;
   oiTotalTvoo: number;
   oiValid: boolean;
   tvoo: number;
   esfAerList: Array<{ id: number; descricao: string }>;
   tiposMissaoList: Array<{ id: number; cod: string; desc: string }>;
}

export function OrdensInstrucaoSection({
   oiItems,
   addOiItem,
   removeOiItem,
   updateOiItem,
   oiTotalTvoo,
   oiValid,
   tvoo,
   esfAerList,
   tiposMissaoList,
}: OrdensInstrucaoSectionProps) {
   return (
      <section className="mt-6">
         <div className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 shadow-inner dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-3">
               <h3 className="text-[11px] font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400">
                  Ordens de Instrução
               </h3>
               {oiItems.length > 0 && (
                  <span
                     className={clsx(
                        "rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase shadow-sm",
                        oiValid
                           ? "bg-green-100 text-green-700 ring-1 ring-green-300 dark:bg-green-900/40 dark:text-green-400"
                           : "bg-amber-100 text-amber-700 ring-1 ring-amber-300 dark:bg-amber-900/40 dark:text-amber-400"
                     )}
                  >
                     {minutesToTime(oiTotalTvoo)} / {minutesToTime(tvoo)}
                     {oiValid ? " ✓ REGULAR" : " ⚠ DIVERGENTE"}
                  </span>
               )}
            </div>
            <button
               type="button"
               onClick={addOiItem}
               className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-red-50 hover:text-red-700 hover:ring-red-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-900/50"
            >
               <HiPlus className="h-4 w-4" />
               Nova OI
            </button>
         </div>

         {oiItems.length === 0 ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
               <p className="text-sm font-medium text-gray-500">
                  Nenhuma Ordem de Instrução associada
               </p>
               <p className="mt-1 text-xs text-gray-400">
                  Clique em "Nova OI" se houver registro de treinamento para
                  adicionar à estatística.
               </p>
            </div>
         ) : (
            <div className="space-y-3">
               {oiItems.map((oi) => (
                  <div
                     key={oi.uid}
                     className="grid grid-cols-[1fr_1fr_auto_80px_auto] items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 pr-4 dark:border-gray-700 dark:bg-gray-800"
                  >
                     {/* Esforço Aéreo */}
                     <div className="flex flex-col text-left">
                        <Label className="mb-1 text-[10px] font-bold text-gray-500 uppercase">
                           Esforço Aéreo
                        </Label>
                        <SearchableSelect
                           options={esfAerList.map((e) => ({
                              value: String(e.id),
                              label: e.descricao,
                           }))}
                           value={oi.esf_aer_id ? String(oi.esf_aer_id) : ""}
                           onChange={(val) =>
                              updateOiItem(oi.uid, {
                                 esf_aer_id: val ? Number(val) : null,
                              })
                           }
                           placeholder="Buscar Esforço..."
                           sizing="sm"
                        />
                     </div>
                     {/* Tipo Missão */}
                     <div className="flex flex-col text-left">
                        <Label className="mb-1 text-[10px] font-bold text-gray-500 uppercase">
                           Tipo Missão
                        </Label>
                        <SearchableSelect
                           options={tiposMissaoList.map((t) => ({
                              value: String(t.id),
                              label: `${t.cod} - ${t.desc}`,
                           }))}
                           value={
                              oi.tipo_missao_id ? String(oi.tipo_missao_id) : ""
                           }
                           onChange={(val) =>
                              updateOiItem(oi.uid, {
                                 tipo_missao_id: val ? Number(val) : null,
                              })
                           }
                           placeholder="Buscar Sigla..."
                           sizing="sm"
                        />
                     </div>
                     {/* Reg */}
                     <div className="flex flex-col text-left">
                        <Label className="mb-1 text-[10px] font-bold whitespace-nowrap text-gray-500 uppercase">
                           Regime
                        </Label>
                        <div className="flex overflow-hidden rounded-lg border border-gray-300 shadow-sm dark:border-gray-600">
                           {(
                              [
                                 { v: "d", l: "D" },
                                 { v: "n", l: "N" },
                                 { v: "v", l: "V" },
                              ] as const
                           ).map(({ v, l }) => (
                              <button
                                 key={v}
                                 type="button"
                                 onClick={() =>
                                    updateOiItem(oi.uid, { reg: v })
                                 }
                                 className={clsx(
                                    "flex-1 px-3 py-[7px] text-xs font-bold focus:outline-none",
                                    oi.reg === v
                                       ? "bg-red-800 text-white dark:bg-red-200 dark:text-red-900"
                                       : "bg-white text-red-500 hover:bg-red-100 dark:bg-red-800 dark:text-red-400 dark:hover:bg-red-700",
                                    v !== "d" &&
                                       "border-l border-red-200 dark:border-red-600"
                                 )}
                              >
                                 {l}
                              </button>
                           ))}
                        </div>
                     </div>
                     {/* T.Voo */}
                     <div className="flex flex-col text-left">
                        <Label className="mb-1 text-[10px] font-bold text-gray-500 uppercase">
                           Tempo
                        </Label>
                        <input
                           type="time"
                           value={oi.tvooDisplay || "00:00"}
                           onChange={(e) => {
                              const val = e.target.value;
                              updateOiItem(oi.uid, {
                                 tvooDisplay: val,
                                 tvoo: val ? timeToMinutes(val) : 0,
                              });
                           }}
                           className="w-full rounded-lg border border-gray-300 bg-gray-50 px-2 py-[7px] text-center font-mono text-xs shadow-inner focus:border-red-400 focus:ring-1 focus:ring-red-400 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                        />
                     </div>
                     {/* Excluir */}
                     <div className="flex h-full items-center justify-center pt-[18px]">
                        <button
                           type="button"
                           onClick={() => removeOiItem(oi.uid)}
                           className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                           title="Remover OI"
                        >
                           <HiX className="h-5 w-5" />
                        </button>
                     </div>
                  </div>
               ))}

               {oiItems.length > 0 && !oiValid && tvoo > 0 && (
                  <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800/50 dark:bg-red-900/20">
                     O somatório das OIs (
                     <strong>{minutesToTime(oiTotalTvoo)}</strong>) não coincide
                     com o tempo total da Etapa (
                     <strong>{minutesToTime(tvoo)}</strong>).
                  </div>
               )}
            </div>
         )}
      </section>
   );
}
